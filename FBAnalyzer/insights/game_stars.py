"""'Stars of the game': best 3 forwards, best 3 defense, best goalie for one
match, using the same 0-100 rating formula as the season Rating
(accounts.management.commands.compute_fliiga_stats._rate_skaters/_rate_goalies,
weights shared via insights.rating) but applied to a single game's own stat
line, percentile-ranked against the per-game-instance HistoricalBaseline
types computed by insights.management.commands.compute_baselines
(forward_game_*/defense_game_*/goalie_game_* - see that command's module
docstring for why a season-averaged per-player baseline can't answer "how
good was tonight's game").

Triggered eagerly from insights.ingest.ingest_match_tick's post-game branch,
the moment MatchLineup's final overwrite (role + final plus/minus) lands -
same trigger as compute_post_game_analysis. Produces no GameStars row at all
for a match whose category/stage doesn't have the needed baselines yet -
same "no baseline exists yet" fallback idiom post_game.py already uses for
its own baseline-dependent angles - which resolves itself as more games get
ingested and compute_baselines.py's nightly run picks them up. insights.views'
lazy-fallback endpoint re-runs this for a match that was never live-pushed,
same update_or_create-is-harmless pattern as compute_post_game_analysis.
"""

from collections import defaultdict

from .event_codes import ASSIST_CODE, GOAL_AGAINST_CODE, GOAL_CODE, GOALIE_CODES
from .lineups import DEFENSE_ROLES, FORWARD_ROLES, GOALIE_ROLE
from .models import GameStars, HistoricalBaseline, MatchEvent, MatchLineup, MatchState
from .percentiles import percentile_rank
from .rating import DEFENSE_WEIGHTS, FORWARD_WEIGHTS, GOALIE_WEIGHTS

# Matches compute_baselines.MIN_GOALIE_SHOTS_FOR_GAME_SAMPLE - a 2-minute relief appearance
# facing 1 shot shouldn't be eligible for goalie-of-the-game any more than it should
# contribute a sample to the baseline itself.
MIN_GOALIE_SHOTS_FOR_GAME_STAR = 3
TOP_N_SKATERS = 3

# Local metric-key names deliberately match insights.rating's FORWARD_WEIGHTS/DEFENSE_WEIGHTS/
# GOALIE_WEIGHTS keys exactly, so the same weights dict can blend either a season rate or (here)
# a single game's raw value with no translation layer.
BASELINE_TYPES = {
    'forward': {
        'points_per_game': 'forward_game_points', 'xg5v5_per_game': 'forward_game_xg5v5',
        'plus_minus_per_game': 'forward_game_plus_minus', 'gaxg_per_game': 'forward_game_gaxg',
    },
    'defense': {
        'points_per_game': 'defense_game_points', 'xg5v5_per_game': 'defense_game_xg5v5',
        'plus_minus_per_game': 'defense_game_plus_minus', 'gaxg_per_game': 'defense_game_gaxg',
    },
}
GOALIE_BASELINE_TYPES = {'gsax': 'goalie_game_gsax', 'saveperc': 'goalie_game_saveperc'}


def _load_baselines(baseline_type_map, category, stage):
    """{metric: HistoricalBaseline} for baseline_type_map, or None if any one of them doesn't
    exist yet - all of them are needed to blend a rating, so a partial set isn't usable."""
    out = {}
    for metric, baseline_type in baseline_type_map.items():
        baseline = HistoricalBaseline.objects.filter(
            baseline_type=baseline_type, category=category, stage=stage,
        ).first()
        if baseline is None:
            return None
        out[metric] = baseline
    return out


def _blend(metrics, weights, baselines):
    return round(sum(
        weight * percentile_rank(metrics[metric], baselines[metric].percentiles)
        for metric, weight in weights.items()
    ), 1)


def _player_game_stats(events, lineups):
    """Per-player per-game stat line for one match - same derivation as
    insights.management.commands.compute_baselines' own per-match accumulation (kept in sync
    by hand rather than via a shared helper, since that command works over many prefetched
    matches at once and this works over a single match already in hand). Returns
    (skaters, goalies), each a dict keyed by player_id."""
    shots = [e for e in events if e.code in ('laukaus', 'laukausohi', 'laukausblokattu', 'laukausmaali')]
    shots_by_player = defaultdict(list)
    for s in shots:
        if s.player_id:
            shots_by_player[s.player_id].append(s)
    assists_by_player = defaultdict(int)
    for e in events:
        if e.code == ASSIST_CODE and e.player_id:
            assists_by_player[e.player_id] += 1

    skaters, goalies = {}, {}
    for lineup in lineups:
        if lineup.role in FORWARD_ROLES or lineup.role in DEFENSE_ROLES:
            p_shots = shots_by_player.get(lineup.player_id, [])
            goals = sum(1 for s in p_shots if s.code == GOAL_CODE)
            xg_all = sum(float(s.xg or 0) for s in p_shots)
            xg5v5 = sum(float(s.xg or 0) for s in p_shots if s.situation == 'EVEN')
            skaters[lineup.player_id] = {
                'player_id': lineup.player_id, 'name': lineup.player_name, 'team_id': lineup.team_id,
                'photo_url': lineup.photo_url, 'role': lineup.role,
                'metrics': {
                    'points_per_game': goals + assists_by_player.get(lineup.player_id, 0),
                    'xg5v5_per_game': xg5v5,
                    'plus_minus_per_game': lineup.plus - lineup.minus,
                    'gaxg_per_game': goals - xg_all,
                },
            }
        elif lineup.role == GOALIE_ROLE:
            g_events = [e for e in events if e.code in GOALIE_CODES and e.player_id == lineup.player_id]
            shots_faced = len(g_events)
            if shots_faced < MIN_GOALIE_SHOTS_FOR_GAME_STAR:
                continue
            ga = sum(1 for e in g_events if e.code == GOAL_AGAINST_CODE)
            xgot_faced = sum(float(e.xgot or 0) for e in g_events)
            goalies[lineup.player_id] = {
                'player_id': lineup.player_id, 'name': lineup.player_name, 'team_id': lineup.team_id,
                'photo_url': lineup.photo_url,
                'metrics': {'gsax': xgot_faced - ga, 'saveperc': (shots_faced - ga) / shots_faced},
            }
    return skaters, goalies


def compute_game_stars(match_id):
    state = MatchState.objects.filter(match_id=match_id).first()
    if state is None:
        return None

    events = list(MatchEvent.objects.filter(match_id=match_id))
    lineups = list(MatchLineup.objects.filter(match_id=match_id))
    if not lineups:
        return None

    skaters, goalies = _player_game_stats(events, lineups)
    team_names = {state.team_a_id: state.team_a_name, state.team_b_id: state.team_b_name}

    def rate_all_skaters(role_set, weights, baseline_types):
        """Every skater in role_set, rated and ranked best-first - not just the top 3, so
        this doubles as the source for both the 3/2/1-star picks and the full per-player
        Rating column shown in the match's own line-by-line stat tables (see
        insights.views.game_stars and fliigalivegame.js's drawCharts/ratingFor)."""
        baselines = _load_baselines(baseline_types, state.category, state.stage)
        if baselines is None:
            return []
        rated = [
            {
                'player_id': s['player_id'], 'name': s['name'], 'photo_url': s['photo_url'],
                'team_id': s['team_id'], 'team_name': team_names.get(s['team_id'], ''),
                'rating': _blend(s['metrics'], weights, baselines),
            }
            for s in skaters.values() if s['role'] in role_set
        ]
        rated.sort(key=lambda r: -r['rating'])
        return rated

    def rate_all_goalies():
        if not goalies:
            return []
        baselines = _load_baselines(GOALIE_BASELINE_TYPES, state.category, state.stage)
        if baselines is None:
            return []
        rated = [
            {
                'player_id': g['player_id'], 'name': g['name'], 'photo_url': g['photo_url'],
                'team_id': g['team_id'], 'team_name': team_names.get(g['team_id'], ''),
                'rating': _blend(g['metrics'], GOALIE_WEIGHTS, baselines),
            }
            for g in goalies.values()
        ]
        rated.sort(key=lambda r: -r['rating'])
        return rated

    all_forwards = rate_all_skaters(FORWARD_ROLES, FORWARD_WEIGHTS, BASELINE_TYPES['forward'])
    all_defense = rate_all_skaters(DEFENSE_ROLES, DEFENSE_WEIGHTS, BASELINE_TYPES['defense'])
    all_goalies_rated = rate_all_goalies()

    forwards = all_forwards[:TOP_N_SKATERS]
    defense = all_defense[:TOP_N_SKATERS]
    goalie = all_goalies_rated[0] if all_goalies_rated else None

    if not forwards and not defense and not goalie:
        # No per-game baseline exists yet for this category/stage (season too young) -
        # nothing to rank against, so no GameStars row at all rather than an empty one.
        return None

    # Every rated player (not just the 3/3/1 stars), keyed by player_id - lets the match's
    # own line-by-line stat tables show a Rating for everyone, not only the picks above.
    all_ratings = {r['player_id']: r['rating'] for r in all_forwards + all_defense + all_goalies_rated}

    stars, _ = GameStars.objects.update_or_create(
        match_id=match_id,
        defaults={
            'category': state.category,
            'facts': {'forwards': forwards, 'defense': defense, 'goalie': goalie, 'all_ratings': all_ratings},
        },
    )
    return stars
