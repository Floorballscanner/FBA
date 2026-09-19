"""Nightly (re)computation of HistoricalBaseline percentile distributions
from currently-ingested insights.MatchEvent/MatchState history.

Not season-scoped: HistoricalBaseline has no season_id field, so each
category+stage baseline pools every currently-ingested season for that
combination - as more seasons get backfilled, these simply reflect more
history, which is the intended "historical" reference.

Baseline types - one sample per team/goalie/player (season-averaged rates) -
feed the "lead with whatever's most extreme tonight" pregame/post-game angle
selection (see the pregame design discussion): a team or player far from the
p50 here is notable, regardless of whether that's good or bad.
  - team_xgf_per_game / team_xga_per_game: shot quality created/allowed
  - team_gf_axg_per_game: (actual goals - xG) per game, i.e. finishing
    "luck" - far from 0 means running hot/cold, not necessarily good/bad
  - team_pp_perc / team_sh_perc: special-teams conversion/kill rate
  - goalie_gsax_per_game: (xGOT faced - goals allowed) per game
  - player_points_per_game: (goals + assists) per game

A second family of baseline types is per-GAME-INSTANCE rather than
per-player-season: one sample per (player, single game) played, role-scoped
(forward/defense/goalie - see insights.lineups.FORWARD_ROLES/DEFENSE_ROLES).
These exist to give insights.game_stars.compute_game_stars something to
percentile-rank a single game's stat line against - the per-player-season
baselines above average a whole season into one number per player, which
can't answer "how good was TONIGHT's performance". A season of games
actually gives this family a richer sample than the per-player ones above
even early in a season, since every match contributes many player-game
instances at once (~10-16 forward/defense instances per match) rather than
needing individual players to individually rack up games.
  - forward_game_points / defense_game_points: goals + assists, one game
  - forward_game_xg5v5 / defense_game_xg5v5: 5v5 xG, one game
  - forward_game_plus_minus / defense_game_plus_minus: Torneopal's own
    per-match +/- (MatchLineup.plus - MatchLineup.minus), one game
  - forward_game_gaxg / defense_game_gaxg: goals - xG (all situations), one
    game - the same "luck" quantity as team_gf_axg_per_game, just per player
  - goalie_game_gsax / goalie_game_saveperc: that game's own GSAx (xGOT
    faced - GA, no ice-time normalization - see insights.rating.GOALIE_WEIGHTS'
    docstring for why) and save%, one game

Run nightly via Heroku Scheduler, same as compute_fliiga_stats.py; safe to
re-run any time (update_or_create per baseline_type/category/stage).
"""

import statistics
from collections import defaultdict

from django.core.management.base import BaseCommand

from insights.event_codes import ASSIST_CODE, GOAL_AGAINST_CODE, GOAL_CODE, GOALIE_CODES, SHOT_CODES
from insights.lineups import DEFENSE_ROLES, FORWARD_ROLES, GOALIE_ROLE
from insights.models import HistoricalBaseline, MatchEvent, MatchLineup, MatchState
from insights.special_teams import PENALTY_CODE_RE
from insights.torneopal import CATEGORY_IDS, STAGE_GROUP_IDS

# Below this many games/appearances, a rate stat is too noisy to be worth
# publishing as part of the population a percentile is drawn from.
MIN_SAMPLE_GAMES = 3
# Per-game-instance baselines (see module docstring) need at least this many pooled
# player-game samples overall before they're trustworthy enough to publish - roughly
# 2-3 real games' worth of one role, well short of a whole season.
MIN_GAME_SAMPLES = 30
# A goalie's per-game GSAx/save% sample is skipped below this many shots faced in that
# one game - a 2-minute relief appearance facing 1 shot shouldn't count the same as a
# real start.
MIN_GOALIE_SHOTS_FOR_GAME_SAMPLE = 3


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

        lineups_by_match = defaultdict(list)
        for lineup in MatchLineup.objects.filter(match_id__in=match_by_id.keys()):
            lineups_by_match[lineup.match_id].append(lineup)

        team_totals = defaultdict(lambda: {
            'games': 0, 'xgf': 0.0, 'xga': 0.0, 'gf': 0,
            'pp_goals': 0, 'pp_opp': 0, 'sh_opp': 0, 'pp_goals_against': 0,
        })
        goalie_totals = defaultdict(lambda: {'games': set(), 'xgot_faced': 0.0, 'ga': 0})
        player_totals = defaultdict(lambda: {'games': set(), 'points': 0})

        # Per-game-instance samples (see module docstring) - one entry per (player, match).
        game_samples = {
            'forward': {'points': [], 'xg5v5': [], 'plus_minus': [], 'gaxg': []},
            'defense': {'points': [], 'xg5v5': [], 'plus_minus': [], 'gaxg': []},
        }
        goalie_game_gsax, goalie_game_saveperc = [], []

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

            # --- per-game-instance samples (see module docstring) ---
            shots_by_player = defaultdict(list)
            for s in shots:
                if s.player_id:
                    shots_by_player[s.player_id].append(s)
            assists_by_player_this_match = defaultdict(int)
            for e in evs:
                if e.code == ASSIST_CODE and e.player_id:
                    assists_by_player_this_match[e.player_id] += 1

            for lineup in lineups_by_match.get(match_id, []):
                role_key = 'forward' if lineup.role in FORWARD_ROLES else 'defense' if lineup.role in DEFENSE_ROLES else None
                if role_key:
                    p_shots = shots_by_player.get(lineup.player_id, [])
                    goals = sum(1 for s in p_shots if s.code == GOAL_CODE)
                    xg_all = sum(float(s.xg or 0) for s in p_shots)
                    xg5v5 = sum(float(s.xg or 0) for s in p_shots if s.situation == 'EVEN')
                    game_samples[role_key]['points'].append(goals + assists_by_player_this_match.get(lineup.player_id, 0))
                    game_samples[role_key]['xg5v5'].append(xg5v5)
                    game_samples[role_key]['plus_minus'].append(lineup.plus - lineup.minus)
                    game_samples[role_key]['gaxg'].append(goals - xg_all)
                elif lineup.role == GOALIE_ROLE:
                    g_events = [e for e in evs if e.code in GOALIE_CODES and e.player_id == lineup.player_id]
                    shots_faced = len(g_events)
                    if shots_faced < MIN_GOALIE_SHOTS_FOR_GAME_SAMPLE:
                        continue
                    ga = sum(1 for e in g_events if e.code == GOAL_AGAINST_CODE)
                    xgot_faced = sum(float(e.xgot or 0) for e in g_events)
                    goalie_game_gsax.append(xgot_faced - ga)
                    goalie_game_saveperc.append((shots_faced - ga) / shots_faced)

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

        for role_key in ('forward', 'defense'):
            for metric in ('points', 'xg5v5', 'plus_minus', 'gaxg'):
                self.save_baseline(
                    f'{role_key}_game_{metric}', category, stage, game_samples[role_key][metric],
                    min_samples=MIN_GAME_SAMPLES,
                )
        self.save_baseline('goalie_game_gsax', category, stage, goalie_game_gsax, min_samples=MIN_GAME_SAMPLES)
        self.save_baseline('goalie_game_saveperc', category, stage, goalie_game_saveperc, min_samples=MIN_GAME_SAMPLES)

    def save_baseline(self, baseline_type, category, stage, values, min_samples=1):
        if len(values) < min_samples:
            self.stdout.write(
                f"  {category}/{stage}/{baseline_type}: only {len(values)} samples (need {min_samples}), skipping."
            )
            return
        percs = percentiles(values)
        if percs is None:
            self.stdout.write(f"  {category}/{stage}/{baseline_type}: no samples, skipping.")
            return
        HistoricalBaseline.objects.update_or_create(
            baseline_type=baseline_type, category=category, stage=stage,
            defaults={'percentiles': percs, 'sample_size': len(values)},
        )
        self.stdout.write(f"  {category}/{stage}/{baseline_type}: n={len(values)}, p50={percs['p50']}")
