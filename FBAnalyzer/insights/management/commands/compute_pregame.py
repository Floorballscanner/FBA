"""Computes PregameAnalysis for every currently-known upcoming ('scheduled')
match - i.e. matches insights already knows about via a backfill or a live
push for the season, but that haven't started yet.

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
        qs = MatchState.objects.filter(status='scheduled')
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
