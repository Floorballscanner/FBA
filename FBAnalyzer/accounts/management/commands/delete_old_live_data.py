from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import LiveData

MAX_AGE = timedelta(days=2)


class Command(BaseCommand):
    help = (
        "Deletes LiveData rows whose date (last-updated timestamp) is older than "
        "2 days, so finished games drop off the public /live/ page and out of the "
        "database. Run once a day via Heroku Scheduler."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Show how many rows would be deleted without deleting anything.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        old = LiveData.objects.filter(date__lt=timezone.now() - MAX_AGE)
        count = old.count()

        if dry_run:
            self.stdout.write(f"[dry-run] Would delete {count} live game(s) older than 2 days.")
            return

        old.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} live game(s) older than 2 days."))
