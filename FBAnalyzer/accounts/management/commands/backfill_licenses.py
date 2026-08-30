from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import License

LICENSE_DURATION = timedelta(days=365)


class Command(BaseCommand):
    help = (
        "Creates a 'full' tier License for every currently active, non-staff user "
        "who doesn't already have one. Run this once, right before license tier "
        "gating goes live, so existing paying customers aren't locked out."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Show what would be created without saving anything.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        users = User.objects.filter(is_active=True, is_staff=False, license__isnull=True)

        if not users.exists():
            self.stdout.write("No users need a backfilled license.")
            return

        now = timezone.now()
        for user in users:
            self.stdout.write(f"{'[dry-run] ' if dry_run else ''}Creating full license for {user.username}")
            if not dry_run:
                License.objects.create(
                    user=user,
                    email=user.email,
                    tier='full',
                    is_active=True,
                    starts_at=now,
                    expires_at=now + LICENSE_DURATION,
                )

        self.stdout.write(self.style.SUCCESS(
            f"{'Would create' if dry_run else 'Created'} {users.count()} license(s)."
        ))
