"""Computes PregameAnalysis for every currently-known upcoming ('scheduled')
match - i.e. matches insights already knows about via a backfill or a live
push for the season, but that haven't started yet.

Excludes 'scheduled' rows with no date: these are Torneopal's placeholder
bracket slots ("winner of semifinal 1 vs winner of semifinal 2") that get a
real date only once qualification is decided - if a season ends without the
slot ever resolving, Torneopal leaves it dangling as 'scheduled' forever
with date=None. A match with no known date has no kickoff to preview, so
skip it rather than compute a pregame analysis nobody will ever see -
confirmed live 2026-09-11: dozens of these from 2023-2024 through 2025-2026
were otherwise getting recomputed every run, each one correctly (by
season_id) but pointlessly surfacing that old season's roster/stats.

Run this a few hours before kickoff (Heroku Scheduler), after that day's
backfill_match_events pass so MatchState rows exist for the games about to
be played. Safe to re-run any time before kickoff: each not-yet-final
PregameAnalysis is simply recomputed with the latest history. Once a match
goes live, compute_pregame_analysis() itself refuses to touch it again
(PregameAnalysis.is_final).
"""

from django.core.management.base import BaseCommand

from insights.models import MatchState
from insights.pregame import compute_pregame_analysis
from insights.torneopal import CATEGORY_IDS, STAGE_GROUP_IDS


class Command(BaseCommand):
    help = "Computes PregameAnalysis for every known upcoming match. See module docstring."

    def add_arguments(self, parser):
        parser.add_argument('--category', choices=CATEGORY_IDS.keys())
        parser.add_argument('--stage', choices=STAGE_GROUP_IDS.keys())
        parser.add_argument('--match-id', help="Compute only this one match_id.")

    def handle(self, *args, **options):
        qs = MatchState.objects.filter(status='scheduled', date__isnull=False)
        if options['match_id']:
            qs = qs.filter(match_id=options['match_id'])
        if options['category']:
            qs = qs.filter(category=options['category'])
        if options['stage']:
            qs = qs.filter(stage=options['stage'])

        matches = list(qs)
        if not matches:
            self.stdout.write("No scheduled matches to compute pregame analysis for.")
            return

        for state in matches:
            analysis = compute_pregame_analysis(state.match_id)
            if analysis:
                self.stdout.write(f"  {state.match_id}: {state.team_a_name} vs {state.team_b_name} -> computed")
            else:
                self.stdout.write(f"  {state.match_id}: skipped (missing team data)")
