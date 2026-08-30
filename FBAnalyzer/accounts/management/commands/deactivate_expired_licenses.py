from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import License


class Command(BaseCommand):
    help = "Deactivates any License (and all its seats' Users) whose expires_at has passed."

    def handle(self, *args, **options):
        expired = License.objects.filter(is_active=True, expires_at__lt=timezone.now())
        count = 0
        for license in expired:
            license.is_active = False
            license.save(update_fields=['is_active'])
            for seat in license.seats.all():
                if seat.user is not None:
                    seat.user.is_active = False
                    seat.user.save(update_fields=['is_active'])
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Deactivated {count} expired license(s)."))
