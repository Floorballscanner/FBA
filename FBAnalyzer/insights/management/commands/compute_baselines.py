"""Nightly (re)computation of HistoricalBaseline percentile distributions
from currently-ingested insights.MatchEvent/MatchState history.

Not season-scoped: HistoricalBaseline has no season_id field, so each
category+stage baseline pools every currently-ingested season for that
combination - as more seasons get backfilled, these simply reflect more
history, which is the intended "historical" reference.

Baseline types - one sample per team/goalie/player - feed the "lead with
whatever's most extreme tonight" pregame-angle selection (see the pregame
design discussion): a team or player far from the p50 here is notable,
regardless of whether that's good or bad.
  - team_xgf_per_game / team_xga_per_game: shot quality created/allowed
  - team_gf_axg_per_game: (actual goals - xG) per game, i.e. finishing
    "luck" - far from 0 means running hot/cold, not necessarily good/bad
  - team_pp_perc / team_sh_perc: special-teams conversion/kill rate
  - goalie_gsax_per_game: (xGOT faced - goals allowed) per game
  - player_points_per_game: (goals + assists) per game

Run nightly via Heroku Scheduler, same as compute_fliiga_stats.py; safe to
re-run any time (update_or_create per baseline_type/category/stage).
"""

import statistics
from collections import defaultdict

from django.core.management.base import BaseCommand

from insights.event_codes import ASSIST_CODE, GOAL_AGAINST_CODE, GOAL_CODE, GOALIE_CODES, SHOT_CODES
from insights.models import HistoricalBaseline, MatchEvent, MatchState
from insights.special_teams import PENALTY_CODE_RE
from insights.torneopal import CATEGORY_IDS, STAGE_GROUP_IDS

# Below this many games/appearances, a rate stat is too noisy to be worth
# publishing as part of the population a percentile is drawn from.
MIN_SAMPLE_GAMES = 3


def is_penalty(code):
    return bool(PENALTY_CODE_RE.match(code or ''))


def percentiles(values):
    if not values:
        return None
    values = sorted(values)
    if len(values) == 1:
        v = round(values[0], 3)
        return {'p10': v, 'p25': v, 'p50': v, 'p75': v, 'p90': v, 'mean': v, 'min': v, 'max': v}
    qs = statistics.quantiles(values, n=100, method='inclusive')
    return {
        'p10': round(qs[9], 3), 'p25': round(qs[24], 3), 'p50': round(qs[49], 3),
        'p75': round(qs[74], 3), 'p90': round(qs[89], 3),
        'mean': round(statistics.fmean(values), 3),
        'min': round(values[0], 3), 'max': round(values[-1], 3),
    }


class Command(BaseCommand):
    help = "Recomputes HistoricalBaseline percentile distributions from ingested match history. See module docstring."

    def add_arguments(self, parser):
        parser.add_argument('--category', choices=CATEGORY_IDS.keys())
        parser.add_argument('--stage', choices=STAGE_GROUP_IDS.keys())

    def handle(self, *args, **options):
        categories = [options['category']] if options['category'] else list(CATEGORY_IDS)
        stages = [options['stage']] if options['stage'] else list(STAGE_GROUP_IDS)

        for category in categories:
            for stage in stages:
                self.handle_combo(category, stage)

    def handle_combo(self, category, stage):
        matches = list(MatchState.objects.filter(category=category, stage=stage, status='played'))
        if not matches:
            self.stdout.write(f"  No played matches ingested yet for {category}/{stage}, skipping.")
            return

        match_by_id = {m.match_id: m for m in matches}
        events = MatchEvent.objects.filter(match_id__in=match_by_id.keys())
        events_by_match = defaultdict(list)
        for e in events:
            events_by_match[e.match_id].append(e)

        team_totals = defaultdict(lambda: {
            'games': 0, 'xgf': 0.0, 'xga': 0.0, 'gf': 0,
            'pp_goals': 0, 'pp_opp': 0, 'sh_opp': 0, 'pp_goals_against': 0,
        })
        goalie_totals = defaultdict(lambda: {'games': set(), 'xgot_faced': 0.0, 'ga': 0})
        player_totals = defaultdict(lambda: {'games': set(), 'points': 0})

        for match_id, evs in events_by_match.items():
            state = match_by_id[match_id]
            team_ids = {'A': state.team_a_id, 'B': state.team_b_id}
            if not team_ids['A'] or not team_ids['B']:
                continue

            shots = [e for e in evs if e.code in SHOT_CODES]

            for side, team_id in team_ids.items():
                opp_side = 'B' if side == 'A' else 'A'
                own_shots = [s for s in shots if s.team == side]
                opp_shots = [s for s in shots if s.team == opp_side]

                t = team_totals[team_id]
                t['games'] += 1
                t['xgf'] += sum(float(s.xg or 0) for s in own_shots)
                t['xga'] += sum(float(s.xg or 0) for s in opp_shots)
                t['gf'] += sum(1 for s in own_shots if s.code == GOAL_CODE)
                t['pp_goals'] += sum(1 for s in own_shots if s.code == GOAL_CODE and s.situation == 'PP')
                t['pp_goals_against'] += sum(1 for s in opp_shots if s.code == GOAL_CODE and s.situation == 'PP')
                t['pp_opp'] += sum(1 for e in evs if e.team == opp_side and is_penalty(e.code))
                t['sh_opp'] += sum(1 for e in evs if e.team == side and is_penalty(e.code))

            for e in evs:
                if not e.player_id:
                    continue
                if e.code in GOALIE_CODES:
                    g = goalie_totals[e.player_id]
                    g['games'].add(match_id)
                    g['xgot_faced'] += float(e.xgot or 0)
                    if e.code == GOAL_AGAINST_CODE:
                        g['ga'] += 1
                # "games" here means "any event with this player_id in this
                # match" - there's no lineup/roster data in MatchEvent, so
                # this is an appearance proxy, not a confirmed roster spot.
                player_totals[e.player_id]['games'].add(match_id)
                if e.code in (GOAL_CODE, ASSIST_CODE):
                    player_totals[e.player_id]['points'] += 1

        xgf_per_game, xga_per_game, gf_axg_per_game, pp_perc, sh_perc = [], [], [], [], []
        for t in team_totals.values():
            if t['games'] < MIN_SAMPLE_GAMES:
                continue
            xgf_per_game.append(t['xgf'] / t['games'])
            xga_per_game.append(t['xga'] / t['games'])
            gf_axg_per_game.append((t['gf'] - t['xgf']) / t['games'])
            if t['pp_opp']:
                pp_perc.append(t['pp_goals'] / t['pp_opp'])
            if t['sh_opp']:
                sh_perc.append(1 - t['pp_goals_against'] / t['sh_opp'])

        gsax_per_game = [
            (g['xgot_faced'] - g['ga']) / len(g['games'])
            for g in goalie_totals.values() if len(g['games']) >= MIN_SAMPLE_GAMES
        ]
        points_per_game = [
            p['points'] / len(p['games'])
            for p in player_totals.values() if len(p['games']) >= MIN_SAMPLE_GAMES
        ]

        self.save_baseline('team_xgf_per_game', category, stage, xgf_per_game)
        self.save_baseline('team_xga_per_game', category, stage, xga_per_game)
        self.save_baseline('team_gf_axg_per_game', category, stage, gf_axg_per_game)
        self.save_baseline('team_pp_perc', category, stage, pp_perc)
        self.save_baseline('team_sh_perc', category, stage, sh_perc)
        self.save_baseline('goalie_gsax_per_game', category, stage, gsax_per_game)
        self.save_baseline('player_points_per_game', category, stage, points_per_game)

    def save_baseline(self, baseline_type, category, stage, values):
        percs = percentiles(values)
        if percs is None:
            self.stdout.write(f"  {category}/{stage}/{baseline_type}: no samples, skipping.")
            return
        HistoricalBaseline.objects.update_or_create(
            baseline_type=baseline_type, category=category, stage=stage,
            defaults={'percentiles': percs, 'sample_size': len(values)},
        )
        self.stdout.write(f"  {category}/{stage}/{baseline_type}: n={len(values)}, p50={percs['p50']}")
