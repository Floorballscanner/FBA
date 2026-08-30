from datetime import datetime

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import License, LicenseSeat

# Known legacy customers with a real, already-agreed expiry date (confirmed by the
# business owner from Holvi order history), keyed by username. Some of these accounts
# are currently marked inactive even though their paid year hasn't elapsed yet — those
# get reactivated here too. Everyone else falls back to DEFAULT_EXPIRES_AT below.
OVERRIDES = {
    'andris@fsmasters.lv': {'tier': 'team', 'expires_at': datetime(2026, 12, 4), 'reactivate': True},
    'janne.kytola@tpssalibandy.fi': {'tier': 'team', 'expires_at': datetime(2026, 11, 6), 'reactivate': True},
    'walterveas@hotmail.com': {'tier': 'trial', 'expires_at': datetime(2026, 9, 5)},
}
# Confirmed by the business owner for the remaining active legacy accounts that don't
# have a specific known expiry date on file.
DEFAULT_TIER = 'team'
DEFAULT_EXPIRES_AT = datetime(2026, 9, 30)


class Command(BaseCommand):
    help = (
        "Creates a License+LicenseSeat for every currently active, non-staff user who "
        "doesn't already have one (defaulting to 'team' tier, expiring at "
        "DEFAULT_EXPIRES_AT), plus a fixed list of known legacy customers in OVERRIDES "
        "with their real remaining license time (some of whom are reactivated too). "
        "Run this once, right before license tier gating goes live, so existing paying "
        "customers aren't locked out."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Show what would be created without saving anything.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        prefix = '[dry-run] ' if dry_run else ''
        created = 0

        active_users = User.objects.filter(is_active=True, is_staff=False, licenseseat__isnull=True)
        override_usernames = set(OVERRIDES.keys())
        active_usernames = set(active_users.values_list('username', flat=True))

        for user in active_users:
            override = OVERRIDES.get(user.username, {})
            tier = override.get('tier', DEFAULT_TIER)
            expires_at = override.get('expires_at', DEFAULT_EXPIRES_AT)
            self.stdout.write(f"{prefix}Creating {tier} license for {user.username}, expires {expires_at.date()}")
            if not dry_run:
                self._create_license(user, tier, expires_at)
            created += 1

        # Overrides for users who aren't currently active (need reactivating first) or
        # who already have a seat don't show up in the queryset above.
        for username in override_usernames - active_usernames:
            override = OVERRIDES[username]
            if not override.get('reactivate'):
                continue
            try:
                user = User.objects.get(username=username, is_staff=False, licenseseat__isnull=True)
            except User.DoesNotExist:
                continue
            tier = override['tier']
            expires_at = override['expires_at']
            self.stdout.write(
                f"{prefix}Reactivating {username} and creating {tier} license, expires {expires_at.date()}"
            )
            if not dry_run:
                user.is_active = True
                user.save()
                self._create_license(user, tier, expires_at)
            created += 1

        if created == 0:
            self.stdout.write("No users need a backfilled license.")
            return

        self.stdout.write(self.style.SUCCESS(f"{'Would create' if dry_run else 'Created'} {created} license(s)."))

    @staticmethod
    def _create_license(user, tier, expires_at):
        license = License.objects.create(
            tier=tier,
            max_seats=1,
            is_active=True,
            starts_at=timezone.now(),
            expires_at=timezone.make_aware(expires_at) if timezone.is_naive(expires_at) else expires_at,
        )
        LicenseSeat.objects.create(license=license, user=user, email=user.email)
