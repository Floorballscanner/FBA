from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from accounts.models import License, LicenseSeat


class Command(BaseCommand):
    help = (
        "Creates a 'team' tier License+LicenseSeat for every currently active, non-staff "
        "user who doesn't already have one. Run this once, right before license tier "
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
        users = User.objects.filter(is_active=True, is_staff=False, licenseseat__isnull=True)

        if not users.exists():
            self.stdout.write("No users need a backfilled license.")
            return

        for user in users:
            self.stdout.write(f"{'[dry-run] ' if dry_run else ''}Creating team license for {user.username}")
            if not dry_run:
                license = License.objects.create(tier='team', max_seats=1, is_active=True)
                LicenseSeat.objects.create(license=license, user=user, email=user.email)

        self.stdout.write(self.style.SUCCESS(
            f"{'Would create' if dry_run else 'Created'} {users.count()} license(s)."
        ))
