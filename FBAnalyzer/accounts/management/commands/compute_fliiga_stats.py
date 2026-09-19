"""Computes and caches F-Liiga team/player/goalie statistics tables.

This replaces client-side computation that used to run in the browser on every
page load (fliigastatspage.js): for one season/category/stage combination it
needed ~400+ sequential calls to the Torneopal API (one getMatch call per
played game for events, ANOTHER getMatch call per game for lineups, and a
getTeam call per team for players plus another for goalies — all one at a
time). That routinely took tens of seconds to minutes.

This command does the same computation once, server-side, with:
  - one getMatch call per game (events and lineups both come back in that
    same response — the old code fetched it twice)
  - one getTeam call per team (players and goalies both come from that same
    response — the old code fetched it twice)
  - all of the above run concurrently instead of one at a time

...and caches the result in FliigaSeasonStats. Once every match in a
season/category/stage is "Played", the row is marked is_final and this
command skips it on every future run — that combination can never produce
new data again.

Run daily via Heroku Scheduler (no arguments = recompute every non-final
combination). Use --season/--category/--stage to force one combination,
including an already-final one, e.g. for the initial backfill.
"""

from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.core.management.base import BaseCommand

from accounts.models import FliigaSeasonStats
from insights.xg_model import calc_xg
from insights.lineups import DEFENSE_ROLES, FORWARD_ROLES, parse_position
from insights.rating import DEFENSE_WEIGHTS, FORWARD_WEIGHTS, GOALIE_WEIGHTS
from insights.special_teams import (
    abs_game_time, parse_penalty_segments, situation_from_goal_tag, compute_shot_situations, find_goal_tag,
)
from insights.torneopal import (
    api_get, CATEGORY_IDS, MAX_WORKERS, SEASON_COMPETITION_IDS, STAGE_GROUP_IDS,
)


def num(value, cast=float, default=0):
    try:
        return cast(value)
    except (TypeError, ValueError):
        return default


def round2(x):
    return round(x, 2)


def _resolve_position(raw_position, player_id, positions_by_player):
    """getTeam's own 'position' field comes back blank for many players (confirmed: 95/213
    men in the 2024-2025 regular season alone, including several of the league's top
    scorers) - each match's own lineup entry is far more reliable, so fall back to the role
    seen most often across a player's actual appearances (positions_by_player, built from
    match_details' lineups - see compute_stats)."""
    if raw_position:
        return raw_position
    fallback = positions_by_player.get(player_id)
    return fallback.most_common(1)[0][0] if fallback else ''


# Player rating (0-100): forwards and defense are each rated within their own pool, using
# different metric weights - never compared to each other on one flat scale. Every reference
# system from other sports does the same (PFF grades, soccer's PlayeRank, NHL WAR/GSAx-based
# models): a defenseman's points-per-game sits at a structurally lower scale than a forward's
# (confirmed with real 2026-2027 data: median 0.11 xG5v5/game for defense vs. 0.32 for
# forwards - roughly a third), so comparing them directly would just reward playing forward.
# See insights.lineups.ROLE_LABELS for what each role abbreviation means; FORWARD_ROLES/
# DEFENSE_ROLES and the FORWARD_WEIGHTS/DEFENSE_WEIGHTS/GOALIE_WEIGHTS below live in
# insights.lineups/insights.rating so insights.game_stars' per-game rating and
# insights.compute_baselines' per-game baselines can share the exact same grouping/weights.
MIN_GAMES_FOR_RATING = 2  # skaters need at least this many games before a Rating is published,
# rather than one noisy game standing in for a season - with real 2026-2027 data (2 weeks into
# the season) almost nobody clears this yet, so most players simply show no Rating for now;
# expected, not a bug, and fills in as more games are played.


def _percentile_of(value, values):
    """Exact percentile rank (0-100) of value within values. Simpler than
    insights.percentiles.percentile_rank, which interpolates against a compressed 7-point
    HistoricalBaseline summary because that's all a stored baseline keeps - here the whole
    population is already in memory, so this just counts directly. Ties split the credit
    between them (the "mean rank" convention) rather than all claiming the same rank."""
    n = len(values)
    if n <= 1:
        return 50.0
    below = sum(1 for v in values if v < value)
    equal = sum(1 for v in values if v == value)
    return (below + 0.5 * (equal - 1)) / (n - 1) * 100


def _rate_skaters(player_stats):
    """Adds a 0-100 'Rating' key to every player dict in player_stats (None if they haven't
    played enough games yet - see MIN_GAMES_FOR_RATING, or if their Position isn't a
    recognised forward/defense role)."""
    for p in player_stats:
        p['Rating'] = None
    for role_set, weights in ((FORWARD_ROLES, FORWARD_WEIGHTS), (DEFENSE_ROLES, DEFENSE_WEIGHTS)):
        pool = [p for p in player_stats if p.get('Position') in role_set and p['Games'] >= MIN_GAMES_FOR_RATING]
        if not pool:
            continue
        rates = {
            p['ID']: {
                'points_per_game': p['P'] / p['Games'],
                'xg5v5_per_game': p['xG5v5'] / p['Games'],
                'plus_minus_per_game': p['plus_minus'] / p['Games'],
                'gaxg_per_game': p['GAxG'] / p['Games'],
            }
            for p in pool
        }
        percentiles = {metric: [r[metric] for r in rates.values()] for metric in weights}
        for p in pool:
            r = rates[p['ID']]
            p['Rating'] = round(
                sum(weight * _percentile_of(r[metric], percentiles[metric]) for metric, weight in weights.items()), 1
            )


def _rate_goalies(goalie_stats):
    """Same idea as _rate_skaters, one pool (goalies aren't split by role)."""
    for g in goalie_stats:
        g['Rating'] = None
    pool = [g for g in goalie_stats if g['Games'] >= MIN_GAMES_FOR_RATING]
    if not pool:
        return
    # GOALIE_WEIGHTS' 'gsax' key is generic (see insights.rating) - the season Rating's own
    # value for it is the per-60-minutes rate, GSAx60.
    rates = {g['ID']: {'gsax': g['GSAx60'], 'saveperc': g['SavePerc']} for g in pool}
    percentiles = {metric: [r[metric] for r in rates.values()] for metric in GOALIE_WEIGHTS}
    for g in pool:
        r = rates[g['ID']]
        g['Rating'] = round(
            sum(weight * _percentile_of(r[metric], percentiles[metric]) for metric, weight in GOALIE_WEIGHTS.items()), 1
        )



def sanitize_period_lengths(raw):
    """Torneopal's period_lengths_sec occasionally reports a wildly wrong value for
    one period (seen in real data: 7200 instead of 1200 for a regulation period,
    match_id 868881) or a bogus trailing element past index 4 (seen: 3599 as a 6th
    entry, match 929541) - clamp each of the 5 real slots (pregame buffer + 3
    regulation periods + OT) to a sane floorball bound and always pad/truncate to
    exactly that length, instead of trusting the raw array's own length or values.
    Anything computing playing time or shot situations from this would otherwise
    silently explode."""
    raw = raw or []
    defaults = [0, 1200, 1200, 1200, 300]
    lengths = [0]
    for i in range(1, 5):
        v = raw[i] if i < len(raw) else defaults[i]
        cap = 1200 if i <= 3 else 600
        lengths.append(min(num(v, int, defaults[i]), cap))
    return lengths


def _stints_from_segments(segments, nominal_duration, period_lengths, shots_against):
    """Turns a list of [player_id_or_None, name, start_time] segments (already in
    chronological order, first one starting at kickoff) into stints, tallying each
    stint's GA/SA/xGOTA from shots_against timestamped inside its window. Segments
    with player_id None (nobody in net - see goalie_stints) contribute no stint at
    all, so that time isn't credited to anyone."""
    stints = []
    for i, (player_id, name, start) in enumerate(segments):
        range_start = 0 if i == 0 else start
        is_last = (i + 1 == len(segments))
        range_end = nominal_duration if is_last else segments[i + 1][2]
        if not player_id:
            continue
        # Half-open [start, end) except the final stint, which also claims anything
        # timestamped exactly at nominal_duration.
        shot_end = range_end + 1 if is_last else range_end
        stint_shots = [
            s for s in shots_against
            if range_start <= abs_game_time(s.get('period') or 1, s.get('time_sec') or 0, period_lengths) < shot_end
        ]
        sog = [s for s in stint_shots if s['code'] in ('laukausmaali', 'laukaus')]
        goals = [s for s in stint_shots if s['code'] == 'laukausmaali']
        stints.append({
            'player_id': player_id, 'name': name,
            'seconds': max(range_end - range_start, 0),
            'GA': len(goals), 'SA': len(sog),
            'xGOTA': sum(s['xGOT'] for s in sog),
        })
    return stints


def _goalie_stints_from_saves(match_events, lineups, team_key, team_id_str, period_lengths, nominal_duration, shots_against):
    """Fallback for a match with no mvvaihto data for this side at all: infer
    changes from the tagged player_id on the goalie's own torjunta/paastetty (save/
    goal-against) events instead. Can't see own-goalie-pulled empty-net time (no
    goalie is tagged on any save/goal-against event either way to signal the gap,
    so it silently keeps crediting whoever was in net last) - mvvaihto's explicit
    pois/sisaan markers are what avoid that, see
    goalie_stints."""
    events_sorted = sorted(
        (e for e in match_events if e.get('code') in ('torjunta', 'paastetty') and e.get('team') == team_key),
        key=lambda e: abs_game_time(e.get('period') or 1, e.get('time_sec') or 0, period_lengths),
    )
    changes = []
    for e in events_sorted:
        player_id = str(e.get('player_id') or '')
        if not player_id:
            continue
        t = abs_game_time(e.get('period') or 1, e.get('time_sec') or 0, period_lengths)
        if not changes or changes[-1][0] != player_id:
            changes.append([player_id, e.get('player_name') or '', t])

    if not changes:
        # No goalie events at all (e.g. a shutout facing zero shots) - fall back to
        # the lineup's starting goalie for the whole match.
        starter = next(
            (l for l in lineups if str(l.get('team_id')) == team_id_str and l.get('position') == 'MV/1'),
            None,
        )
        if not starter:
            return []
        changes = [[str(starter.get('player_id') or ''), starter.get('player_name') or '', 0]]

    return _stints_from_segments(changes, nominal_duration, period_lengths, shots_against)


def goalie_stints(match_events, lineups, team_key, team_id_str, period_lengths, nominal_duration, shots_against):
    """Splits one team's share of a match into per-goalie playing-time stints.

    Torneopal's own playing_time_min is always 0 for every player in every match
    (confirmed against real data), so it can't be used. Instead this reads the
    team's own mvvaihto (goalie substitution) events - the same signal
    insights.special_teams.compute_shot_situations already uses to tag '6V5' shots
    (own goalie pulled for an extra attacker): the opening event of the match names
    the starter (empty description); a 'maalivahti pois' ("goalie out") event marks
    the goalie leaving the ice with nobody credited until a following
    'maalivahti sisaan'/'sisään' ("goalie in") event names whoever returns - the
    same player_id if they were simply pulled for an extra attacker, or someone
    else if a real substitution happened while pulled. Without this, a pulled
    goalie's empty-net window would silently keep counting as their own playing
    time, since no goalie is tagged on any save/goal-against event either way to
    signal the gap.

    The last segment (or the only one, if there was no change) runs to
    `nominal_duration` - the match's own known regulation+OT length (see the
    caller) - not the timestamp of whichever shot/goalie event happened to be
    recorded last, which almost always falls a few seconds to half a minute short
    of the real period end (most periods end on a whistle/faceoff with no shot in
    the closing seconds).
    """
    mv_events = sorted(
        (e for e in match_events if e.get('code') == 'mvvaihto' and e.get('team') == team_key),
        key=lambda e: abs_game_time(e.get('period') or 1, e.get('time_sec') or 0, period_lengths),
    )

    segments = []  # [player_id_or_None, name, start_time]
    for e in mv_events:
        t = abs_game_time(e.get('period') or 1, e.get('time_sec') or 0, period_lengths)
        desc = (e.get('description') or '').lower()
        if 'pois' in desc:
            segments.append([None, '', t])
        elif 'sis' in desc or not segments:
            # 'sisaan'/'sisään' (goalie back in), or the match-opening assignment
            # (empty description, no segment recorded yet).
            segments.append([str(e.get('player_id') or ''), e.get('player_name') or '', t])
        # An mvvaihto with neither "pois" nor "sis" in its description, after the
        # opening assignment, isn't a pattern seen in real data - ignored rather
        # than guessed at.

    if not segments:
        return _goalie_stints_from_saves(match_events, lineups, team_key, team_id_str, period_lengths, nominal_duration, shots_against)

    return _stints_from_segments(segments, nominal_duration, period_lengths, shots_against)


class Command(BaseCommand):
    help = "Computes and caches F-Liiga team/player/goalie stats tables. See module docstring."

    def add_arguments(self, parser):
        parser.add_argument('--season', choices=SEASON_COMPETITION_IDS.keys())
        parser.add_argument('--category', choices=CATEGORY_IDS.keys())
        parser.add_argument('--stage', choices=STAGE_GROUP_IDS.keys())
        parser.add_argument(
            '--force', action='store_true',
            help="Recompute even if the combination is already marked final.",
        )

    def handle(self, *args, **options):
        seasons = [options['season']] if options['season'] else list(SEASON_COMPETITION_IDS)
        categories = [options['category']] if options['category'] else list(CATEGORY_IDS)
        stages = [options['stage']] if options['stage'] else list(STAGE_GROUP_IDS)

        for season_id in seasons:
            for category in categories:
                for stage in stages:
                    self.handle_combo(season_id, category, stage, force=options['force'])

    def handle_combo(self, season_id, category, stage, force):
        existing = FliigaSeasonStats.objects.filter(
            season_id=season_id, category=category, stage=stage,
        ).first()
        if existing and existing.is_final and not force:
            self.stdout.write(f"Skipping {season_id}/{category}/{stage} — already final.")
            return

        self.stdout.write(f"Computing {season_id}/{category}/{stage} ...")
        matches = api_get(
            'getMatches',
            season_id=season_id,
            competition_id=SEASON_COMPETITION_IDS[season_id],
            category_id=CATEGORY_IDS[category],
            group_id=STAGE_GROUP_IDS[stage],
        ).get('matches') or []

        if not matches:
            self.stdout.write(f"  No matches yet for {season_id}/{category}/{stage}, nothing to cache.")
            return

        matches_played = [m for m in matches if m.get('status') == 'Played']
        is_final = len(matches_played) == len(matches)

        if not matches_played:
            self.stdout.write(f"  No played matches yet for {season_id}/{category}/{stage}, nothing to cache.")
            return

        # Deliberately not using getTeams here: it returns every team ever
        # registered under this category_id, including teams that actually
        # compete at a different level and never appear in this stage's
        # matches at all (confirmed: getTeams returned 18 teams for men's
        # 2024-2025, but only 12 of them ever played a regular-season match).
        # The team list for this stage is exactly the teams that appear in
        # its own matches.
        teams_by_id = {}
        for m in matches_played:
            teams_by_id[str(m['team_A_id'])] = m['team_A_name']
            teams_by_id[str(m['team_B_id'])] = m['team_B_name']
        teams = [{'team_id': team_id, 'team_name': name} for team_id, name in teams_by_id.items()]

        # One getMatch call per played match, in parallel. events + lineups
        # both come back in this single response.
        match_details = {}
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {
                pool.submit(api_get, 'getMatch', match_id=m['match_id']): m['match_id']
                for m in matches_played
            }
            for future in as_completed(futures):
                match_id = futures[future]
                match_details[match_id] = future.result().get('match') or {}

        # One getTeam call per team, in parallel. players + goalies both come
        # from this same response.
        team_details = {}
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {
                pool.submit(
                    api_get, 'getTeam', team_id=t['team_id'],
                    competition_id=SEASON_COMPETITION_IDS[season_id],
                    category_id=CATEGORY_IDS[category],
                ): t['team_id']
                for t in teams
            }
            for future in as_completed(futures):
                team_id = futures[future]
                team_details[team_id] = future.result().get('team') or {}

        team_stats, player_stats, goalie_stats = self.compute_stats(
            teams, matches_played, match_details, team_details, category,
        )

        FliigaSeasonStats.objects.update_or_create(
            season_id=season_id, category=category, stage=stage,
            defaults={
                'team_stats': team_stats,
                'player_stats': player_stats,
                'goalie_stats': goalie_stats,
                'is_final': is_final,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f"  Saved {season_id}/{category}/{stage}: {len(team_stats)} teams, "
            f"{len(player_stats)} players, {len(goalie_stats)} goalies"
            f"{' (final)' if is_final else ''}."
        ))

    def compute_stats(self, teams, matches_played, match_details, team_details, category):
        # --- Shots, xG/xGOT per shot ---
        shots = []
        for match in matches_played:
            match_id = match['match_id']
            events = match_details.get(match_id, {}).get('events') or []
            period_lengths = sanitize_period_lengths(match_details.get(match_id, {}).get('period_lengths_sec'))
            shot_situations = compute_shot_situations(events, period_lengths)
            for event in events:
                code = event.get('code')
                if code not in ('laukausohi', 'laukausblokattu', 'laukausmaali', 'laukaus'):
                    continue
                x, y = 0.0, 0.0
                location = event.get('location') or ''
                parts = location.split(',')
                if len(parts) == 2:
                    x, y = num(parts[0]), num(parts[1])
                shot = dict(event)
                shot['match_id'] = match_id
                shot['team_id'] = str(event.get('team_id') or '')
                shot['player_id'] = event.get('player_id')
                if code == 'laukausmaali':
                    # '6V5' (own goalie pulled) takes priority and is computed the same
                    # way as any other shot; otherwise a goal keeps its own tag-based
                    # determination (see compute_shot_situations' docstring).
                    situation = shot_situations.get(event.get('event_id')) or situation_from_goal_tag(find_goal_tag(events, shot))
                else:
                    situation = shot_situations.get(event.get('event_id'), 'EVEN')
                shot['situation'] = situation
                res = calc_xg(x, y, category, situation)
                shot['xG'] = res['xG']
                shot['xGOT'] = res['xGOT'] if code in ('laukaus', 'laukausmaali') else 0
                shots.append(shot)

        # --- Per-match aggregates (shots/goals/xG, SOG, goalies) ---
        for match in matches_played:
            match_id = match['match_id']
            team_a_id, team_b_id = str(match['team_A_id']), str(match['team_B_id'])
            match_shots = [s for s in shots if s['match_id'] == match_id]
            shots_a = [s for s in match_shots if s['team_id'] == team_a_id]
            shots_b = [s for s in match_shots if s['team_id'] == team_b_id]
            goals_a = [s for s in shots_a if s['code'] == 'laukausmaali']
            goals_b = [s for s in shots_b if s['code'] == 'laukausmaali']
            sog_a = [s for s in shots_a if s['code'] in ('laukausmaali', 'laukaus')]
            sog_b = [s for s in shots_b if s['code'] in ('laukausmaali', 'laukaus')]

            match['xG_A'] = round2(sum(s['xG'] for s in shots_a))
            match['xG_B'] = round2(sum(s['xG'] for s in shots_b))
            match['xGOT_A'] = round2(sum(s['xGOT'] for s in shots_a))
            match['xGOT_B'] = round2(sum(s['xGOT'] for s in shots_b))
            match['xGPP_A'] = round2(sum(s['xG'] for s in shots_a if s.get('situation') == 'PP'))
            match['xGPP_B'] = round2(sum(s['xG'] for s in shots_b if s.get('situation') == 'PP'))
            match['xG6v5_A'] = round2(sum(s['xG'] for s in shots_a if s.get('situation') == '6V5'))
            match['xG6v5_B'] = round2(sum(s['xG'] for s in shots_b if s.get('situation') == '6V5'))
            match['S_A'], match['S_B'] = len(shots_a), len(shots_b)
            match['SOG_A'], match['SOG_B'] = len(sog_a), len(sog_b)
            match['G_A'], match['G_B'] = len(goals_a), len(goals_b)
            match['PPG_A'] = sum(1 for s in goals_a if s.get('situation') == 'PP')
            match['PPG_B'] = sum(1 for s in goals_b if s.get('situation') == 'PP')

            # PP "opportunities" are counted as raw penalty events (a 2+2 double-minor
            # counts as one opportunity, matching standard box-score convention) - a
            # team's own opportunities equal the opponent's penalty-event count.
            match_events = match_details.get(match_id, {}).get('events') or []
            pen_events_a = sum(1 for e in match_events if e.get('team') == 'A' and parse_penalty_segments(e.get('code')))
            pen_events_b = sum(1 for e in match_events if e.get('team') == 'B' and parse_penalty_segments(e.get('code')))
            match['PPOpp_A'] = pen_events_b
            match['PPOpp_B'] = pen_events_a

            lineups = match_details.get(match_id, {}).get('lineups') or []
            period_lengths = sanitize_period_lengths(match_details.get(match_id, {}).get('period_lengths_sec'))
            # A goalie's final stint (or their only one, if there was no change)
            # should run to the match's real, known duration - not to the
            # timestamp of whichever shot/goalie event happened to be recorded
            # last, which almost always falls a few seconds to half a minute short
            # of the actual period end (periods routinely end on a whistle/faceoff
            # with no shot in the closing seconds), silently docking every
            # full-game goalie a little time for no real reason. Regulation is
            # always 3 periods; OT is added only if the match actually needed it -
            # read from Torneopal's own points_A/points_B (a 2/1 split means the
            # match was decided in OT or a shootout, 3/0 means regulation), which
            # is simpler and more reliable than scanning events for period >= 4.
            went_to_ot = int(num(match.get('points_A'), int, 0)) in (1, 2) and int(num(match.get('points_B'), int, 0)) in (1, 2)
            nominal_duration = sum(period_lengths[1:4]) + (period_lengths[4] if went_to_ot else 0)
            match['GoalieStintsA'] = goalie_stints(match_events, lineups, 'A', team_a_id, period_lengths, nominal_duration, shots_b)
            match['GoalieStintsB'] = goalie_stints(match_events, lineups, 'B', team_b_id, period_lengths, nominal_duration, shots_a)

        # RL (rangaistuslaukaus?) and TM adjustments, same as the JS.
        for match in matches_played:
            match_id = match['match_id']
            events = match_details.get(match_id, {}).get('events') or []
            for event in events:
                description = (event.get('description') or '')
                if 'rl' in description or 'RL' in description:
                    if event.get('team') == 'A':
                        match['xG_B'] += 0.5
                        match['xGOT_B'] += 0.5
                    elif event.get('team') == 'B':
                        match['xG_A'] += 0.5
                        match['xGOT_A'] += 0.5
                if 'tm' in description or 'TM' in description:
                    if event.get('team') == 'A':
                        match['G_A'] -= 1
                        match['S_A'] -= 1
                    elif event.get('team') == 'B':
                        match['G_B'] -= 1
                        match['S_B'] -= 1

        # --- Team stats ---
        team_stats = []
        for team in teams:
            name = team['team_name']
            ts = {
                'team_id': team['team_id'], 'team_name': name, 'crest': '',
                'Games': 0, 'GF': 0, 'GA': 0, 'GDiff': 0, 'SF': 0, 'SA': 0, 'SDiff': 0,
                'Points': 0,
                'xGF': 0.0, 'xGA': 0.0, 'xGDiff': 0.0, 'xGperc': 0.0,
                'xGOTF': 0.0, 'xGOTA': 0.0, 'xGOTperc': 0.0, 'GFAxG': 0.0, 'GAAxG': 0.0,
                'xGFPP': 0.0, 'xGAPP': 0.0, 'xGF6v5': 0.0, 'xGA6v5': 0.0,
                'PPG': 0, 'PPOpp': 0, 'SHOpp': 0, 'PPGA': 0, 'PPperc': 0.0, 'SHperc': 0.0,
            }
            # Torneopal already computes each team's points for the match (regulation
            # win=3, OT/SO win=2, OT/SO loss=1, regulation loss=0) as points_A/points_B -
            # no need to re-derive win/OT logic ourselves. club_A_crest/club_B_crest are
            # the team's own logo URL, same on every match it plays - grabbed once.
            for match in matches_played:
                if match['team_A_name'] == name:
                    ts['Games'] += 1
                    ts['crest'] = ts['crest'] or match.get('club_A_crest') or ''
                    ts['Points'] += match.get('points_A') or 0
                    ts['GF'] += match['G_A']; ts['GA'] += match['G_B']
                    ts['SF'] += match['S_A']; ts['SA'] += match['S_B']
                    ts['xGF'] += match['xG_A']; ts['xGA'] += match['xG_B']
                    ts['xGOTF'] += match['xGOT_A']; ts['xGOTA'] += match['xGOT_B']
                    ts['xGFPP'] += match['xGPP_A']; ts['xGAPP'] += match['xGPP_B']
                    ts['xGF6v5'] += match['xG6v5_A']; ts['xGA6v5'] += match['xG6v5_B']
                    ts['PPG'] += match['PPG_A']; ts['PPOpp'] += match['PPOpp_A']
                    ts['SHOpp'] += match['PPOpp_B']; ts['PPGA'] += match['PPG_B']
                if match['team_B_name'] == name:
                    ts['Games'] += 1
                    ts['crest'] = ts['crest'] or match.get('club_B_crest') or ''
                    ts['Points'] += match.get('points_B') or 0
                    ts['GF'] += match['G_B']; ts['GA'] += match['G_A']
                    ts['SF'] += match['S_B']; ts['SA'] += match['S_A']
                    ts['xGF'] += match['xG_B']; ts['xGA'] += match['xG_A']
                    ts['xGOTF'] += match['xGOT_B']; ts['xGOTA'] += match['xGOT_A']
                    ts['xGFPP'] += match['xGPP_B']; ts['xGAPP'] += match['xGPP_A']
                    ts['xGF6v5'] += match['xG6v5_B']; ts['xGA6v5'] += match['xG6v5_A']
                    ts['PPG'] += match['PPG_B']; ts['PPOpp'] += match['PPOpp_B']
                    ts['SHOpp'] += match['PPOpp_A']; ts['PPGA'] += match['PPG_A']

            ts['xGDiff'] = round2(ts['xGF'] - ts['xGA'])
            ts['xGperc'] = round2(ts['xGF'] / (ts['xGF'] + ts['xGA'])) if (ts['xGF'] + ts['xGA']) else 0
            ts['GFAxG'] = round2(ts['GF'] - ts['xGF'])
            ts['GAAxG'] = round2(ts['GA'] - ts['xGA'])
            ts['SDiff'] = ts['SF'] - ts['SA']
            ts['GDiff'] = ts['GF'] - ts['GA']
            ts['xGOTperc'] = round2(ts['xGOTF'] / (ts['xGOTF'] + ts['xGOTA'])) if (ts['xGOTF'] + ts['xGOTA']) else 0
            ts['xGF'] = round2(ts['xGF']); ts['xGA'] = round2(ts['xGA'])
            ts['xGOTF'] = round2(ts['xGOTF']); ts['xGOTA'] = round2(ts['xGOTA'])
            ts['xGFPP'] = round2(ts['xGFPP']); ts['xGAPP'] = round2(ts['xGAPP'])
            ts['xGF6v5'] = round2(ts['xGF6v5']); ts['xGA6v5'] = round2(ts['xGA6v5'])
            ts['PPperc'] = round2(ts['PPG'] / ts['PPOpp']) if ts['PPOpp'] else 0.0
            ts['SHperc'] = round2(1 - ts['PPGA'] / ts['SHOpp']) if ts['SHOpp'] else 0.0
            team_stats.append(ts)

        team_stats.sort(key=lambda t: t['xGDiff'], reverse=True)

        # --- Player stats ---
        # Games/goals/assists/points/plus/minus used to trust Torneopal's own
        # per-player matches/goals/assists/points/plus/minus fields from
        # getTeam - but those are season-long totals across every stage the
        # team played (getTeam takes no group_id), so switching between
        # regular season and playoffs never changed a word of them. Computed
        # from our own stage-filtered lineup/shot/event data instead, same
        # idea as S/SM/xG/xGOT below. Torneopal tags on-ice plus/minus itself,
        # per player per goal: each goal gets its own 'maali' marker event
        # (separate from the 'laukausmaali' shot event already used for goals/
        # shots), and every skater on the ice for it gets their own 'plus' (on
        # the scoring team) or 'miinus' (conceding team) event with
        # connected_event_id pointing at that 'maali' event's event_id -
        # confirmed against real match data (5 plus + 5 miinus events per
        # even-strength goal, fewer under special teams).
        games_by_player = defaultdict(set)
        assists_by_player = defaultdict(int)
        plus_by_player = defaultdict(int)
        minus_by_player = defaultdict(int)
        photo_by_player = {}
        # getTeam's own 'position' field (used below) comes back blank for a large share of
        # players, especially in past seasons (confirmed: 95/213 men in 2024-2025 regular
        # season alone) - including some of the league's top scorers. Each match's own lineup
        # entry ("KH/1" etc.) is far more reliable, so track the role seen most often across
        # a player's actual appearances as a fallback.
        positions_by_player = defaultdict(Counter)
        for match in matches_played:
            match_id = match['match_id']
            for lineup in match_details.get(match_id, {}).get('lineups') or []:
                player_id = str(lineup.get('player_id') or '')
                if player_id:
                    games_by_player[player_id].add(match_id)
                    if player_id not in photo_by_player and lineup.get('img_url'):
                        photo_by_player[player_id] = lineup['img_url']
                    role, _ = parse_position(lineup.get('position'))
                    if role:
                        positions_by_player[player_id][role] += 1
            for event in match_details.get(match_id, {}).get('events') or []:
                player_id = str(event.get('player_id') or '')
                if not player_id:
                    continue
                if event.get('code') == 'syotto':
                    assists_by_player[player_id] += 1
                elif event.get('code') == 'plus':
                    plus_by_player[player_id] += 1
                elif event.get('code') == 'miinus':
                    minus_by_player[player_id] += 1

        players_all = []
        for team in teams:
            detail = team_details.get(team['team_id'], {})
            for p in detail.get('players') or []:
                player_id = str(p.get('player_id'))
                position = _resolve_position(p.get('position'), player_id, positions_by_player)
                players_all.append({
                    'ID': player_id,
                    'Team': detail.get('team_name'),
                    'Name': f"{p.get('first_name', '')} {p.get('last_name', '')}".strip(),
                    'Nr': p.get('shirt_number'),
                    'Position': position,
                    'photo': photo_by_player.get(player_id, ''),
                    'Games': len(games_by_player.get(player_id, ())),
                    'G': 0, 'A': assists_by_player.get(player_id, 0), 'P': 0,
                    # S/SM used to trust Torneopal's own shots_total/shots_off_target
                    # fields via getTeam, but those come back blank for most players -
                    # computed from our own shot-level data instead, same as xG/xGOT.
                    'S': 0, 'SM': 0,
                    'plus_minus': plus_by_player.get(player_id, 0) - minus_by_player.get(player_id, 0),
                    # xG/xGOT (all situations) are kept for GAxG only, not
                    # displayed directly - the table shows the per-situation
                    # breakdown below instead.
                    'xG': 0.0, 'xGOT': 0.0,
                    'xG5v5': 0.0, 'xGOT5v5': 0.0,
                    'xGPP': 0.0, 'xGOTPP': 0.0,
                    'xGSH': 0.0, 'xGOTSH': 0.0,
                    'xG6v5': 0.0, 'xGOT6v5': 0.0,
                    'GAxG': 0.0,
                })

        SITUATION_FIELD_SUFFIX = {'EVEN': '5v5', 'PP': 'PP', 'SH': 'SH', '6V5': '6v5'}

        player_stats = [p for p in players_all if p['Games'] > 0]
        for player in player_stats:
            for shot in shots:
                if str(shot.get('player_id')) == player['ID']:
                    player['S'] += 1
                    if shot['code'] == 'laukausohi':
                        player['SM'] += 1
                    if shot['code'] == 'laukausmaali':
                        player['G'] += 1
                    player['xG'] += shot['xG']
                    player['xGOT'] += shot['xGOT']
                    suffix = SITUATION_FIELD_SUFFIX.get(shot.get('situation'))
                    if suffix:
                        player[f'xG{suffix}'] += shot['xG']
                        player[f'xGOT{suffix}'] += shot['xGOT']
            player['P'] = player['G'] + player['A']
            for field in (
                'xG', 'xGOT', 'xG5v5', 'xGOT5v5', 'xGPP', 'xGOTPP', 'xGSH', 'xGOTSH', 'xG6v5', 'xGOT6v5',
            ):
                player[field] = round2(player[field])
            player['GAxG'] = round2(player['G'] - player['xG'])

        player_stats = [p for p in player_stats if p['xG'] > 0]
        player_stats.sort(key=lambda p: p['GAxG'], reverse=True)

        # --- Goalie stats ---
        goalies_all = []
        for team in teams:
            detail = team_details.get(team['team_id'], {})
            for p in detail.get('players') or []:
                player_id = str(p.get('player_id'))
                if _resolve_position(p.get('position'), player_id, positions_by_player) != 'MV':
                    continue
                goalies_all.append({
                    'ID': player_id,
                    'Name': f"{p.get('last_name', '')} {p.get('first_name', '')}".strip(),
                    'Team': detail.get('team_name'),
                    'photo': photo_by_player.get(player_id, ''),
                    'Games': 0, 'PlaySeconds': 0, 'xGOTA': 0.0, 'GA': 0, 'SA': 0, 'Saves': 0,
                    'GSAx': 0.0, 'GSAxPerGame': 0.0,
                    'GA60': 0.0, 'xGOTA60': 0.0, 'GSAx60': 0.0, 'SavePerc': 0.0,
                })

        goalies_by_id = {g['ID']: g for g in goalies_all}
        games_by_goalie = defaultdict(set)
        for match in matches_played:
            for stint in match['GoalieStintsA'] + match['GoalieStintsB']:
                goalie = goalies_by_id.get(stint['player_id'])
                if not goalie or stint['seconds'] <= 0:
                    continue
                games_by_goalie[stint['player_id']].add(match['match_id'])
                goalie['PlaySeconds'] += stint['seconds']
                goalie['xGOTA'] += stint['xGOTA']
                goalie['GA'] += stint['GA']
                goalie['SA'] += stint['SA']
                goalie['Saves'] += stint['SA'] - stint['GA']

        for goalie in goalies_all:
            goalie['Games'] = len(games_by_goalie.get(goalie['ID'], ()))
            goalie['xGOTA'] = round2(goalie['xGOTA'])
            goalie['GSAx'] = round2(goalie['xGOTA'] - goalie['GA'])
            goalie['GSAxPerGame'] = round2(goalie['GSAx'] / goalie['Games']) if goalie['Games'] else 0.0
            minutes = goalie['PlaySeconds'] / 60
            goalie['Minutes'] = round2(minutes)
            goalie['GA60'] = round2(goalie['GA'] / minutes * 60) if minutes else 0.0
            goalie['xGOTA60'] = round2(goalie['xGOTA'] / minutes * 60) if minutes else 0.0
            goalie['GSAx60'] = round2(goalie['GSAx'] / minutes * 60) if minutes else 0.0
            goalie['SavePerc'] = round2(goalie['Saves'] / goalie['SA']) if goalie['SA'] else 0.0

        goalie_stats = [g for g in goalies_all if g['Games'] > 0]
        goalie_stats.sort(key=lambda g: g['GSAxPerGame'], reverse=True)

        _rate_skaters(player_stats)
        _rate_goalies(goalie_stats)

        return team_stats, player_stats, goalie_stats
