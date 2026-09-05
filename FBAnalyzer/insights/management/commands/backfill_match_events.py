"""One-off historical backfill: ingests every already-played F-Liiga match's
events into MatchEvent/MatchState (triggering PostGameAnalysis for each), via
the same insights.ingest.ingest_match_tick() the live client-push endpoint
uses - so a backfilled match and a live-covered one are indistinguishable
afterwards. This is what gives insights.HistoricalBaseline something to
compute percentiles from before any match has ever been watched live.

Skips matches whose MatchState is already 'played' unless --force (same
is_final-skip idea as compute_fliiga_stats.py) - safe to re-run any time,
since ingest_match_tick's upserts are idempotent either way.

Run once manually per season/category/stage you want history for; NOT
scheduled (unlike compute_fliiga_stats.py), since every match going forward
arrives via the live client-push path instead.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed

from django.core.management.base import BaseCommand

from insights.ingest import ingest_raw_match
from insights.models import MatchState
from insights.torneopal import (
    api_get, CATEGORY_IDS, MAX_WORKERS, SEASON_COMPETITION_IDS, STAGE_GROUP_IDS,
)


class Command(BaseCommand):
    help = "One-off backfill of historical F-Liiga match events into the insight engine. See module docstring."

    def add_arguments(self, parser):
        parser.add_argument('--season', choices=SEASON_COMPETITION_IDS.keys())
        parser.add_argument('--category', choices=CATEGORY_IDS.keys())
        parser.add_argument('--stage', choices=STAGE_GROUP_IDS.keys())
        parser.add_argument('--match-id', help="Backfill only this one match_id (e.g. for testing).")
        parser.add_argument(
            '--force', action='store_true',
            help="Re-ingest matches whose MatchState is already 'played'.",
        )

    def handle(self, *args, **options):
        if options['match_id']:
            self.backfill_one_match(options['match_id'], force=options['force'])
            return

        seasons = [options['season']] if options['season'] else list(SEASON_COMPETITION_IDS)
        categories = [options['category']] if options['category'] else list(CATEGORY_IDS)
        stages = [options['stage']] if options['stage'] else list(STAGE_GROUP_IDS)

        for season_id in seasons:
            for category in categories:
                for stage in stages:
                    self.handle_combo(season_id, category, stage, force=options['force'])

    def handle_combo(self, season_id, category, stage, force):
        matches = api_get(
            'getMatches',
            season_id=season_id,
            competition_id=SEASON_COMPETITION_IDS[season_id],
            category_id=CATEGORY_IDS[category],
            group_id=STAGE_GROUP_IDS[stage],
        ).get('matches') or []

        matches_played = [m for m in matches if m.get('status') == 'Played']
        if not matches_played:
            self.stdout.write(f"  No played matches yet for {season_id}/{category}/{stage}, nothing to backfill.")
            return

        if not force:
            already_done = set(
                MatchState.objects.filter(
                    match_id__in=[m['match_id'] for m in matches_played], status='played',
                ).values_list('match_id', flat=True)
            )
            matches_played = [m for m in matches_played if m['match_id'] not in already_done]

        if not matches_played:
            self.stdout.write(f"  {season_id}/{category}/{stage}: everything already backfilled.")
            return

        self.stdout.write(f"Backfilling {len(matches_played)} match(es) for {season_id}/{category}/{stage} ...")

        # Fetch concurrently (I/O only, no DB writes here); ingest sequentially
        # afterwards so concurrent ingest_match_tick() upserts never race.
        match_details = {}
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {
                pool.submit(api_get, 'getMatch', match_id=m['match_id']): m['match_id']
                for m in matches_played
            }
            for future in as_completed(futures):
                match_id = futures[future]
                match_details[match_id] = future.result().get('match') or {}

        for match_id, match in match_details.items():
            self.ingest_one(match_id, match)

        self.stdout.write(self.style.SUCCESS(f"  Done: {season_id}/{category}/{stage}."))

    def backfill_one_match(self, match_id, force):
        if not force and MatchState.objects.filter(match_id=match_id, status='played').exists():
            self.stdout.write(f"{match_id} already backfilled, use --force to re-ingest.")
            return
        match = api_get('getMatch', match_id=match_id).get('match') or {}
        self.ingest_one(match_id, match)

    def ingest_one(self, match_id, match):
        new_status = ingest_raw_match(match_id, match)
        if new_status is None:
            self.stderr.write(f"  {match_id}: unrecognised category_id {match.get('category_id')!r}, skipping.")
            return
        self.stdout.write(f"  {match_id}: {match.get('team_A_name')} vs {match.get('team_B_name')} -> {new_status}")
