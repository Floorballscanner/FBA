"""Shared match-tick ingestion: MatchEvent/MatchState upsert, xG/xGOT/
situation derivation, and the post-game trigger branch.

Used by the live client-push endpoint (insights.views.ingest_match_events),
the one-off historical backfill command
(insights.management.commands.backfill_match_events), and the post-game
lazy-fallback endpoint's recovery path (insights.views.post_game_analysis,
via fetch_and_ingest_match below) - so a live-covered match, a backfilled
one, and a lazily-recovered one all end up indistinguishable in the
database, and none of these paths can drift from the others' derivation
logic.
"""

from datetime import date as date_cls, timedelta

from django.utils import timezone

from .event_codes import GOALIE_CODES, ON_TARGET_CODES, SHOT_CODES
from .live_insights import evaluate_match_insights
from .models import MatchEvent, MatchState
from .post_game import compute_post_game_analysis
from .pregame import compute_pregame_analysis
from .special_teams import abs_game_time, compute_shot_situations, find_goal_tag, situation_from_goal_tag
from .torneopal import api_get, CATEGORY_ID_MAP, STAGE_GROUP_ID_MAP
from .win_probability import compute_win_probability
from .xg_model import calc_xg

INSIGHT_EVAL_GATE = timedelta(seconds=60)

# Same whitelist fliigalivegame.js applies client-side to Torneopal's raw
# event payload - kept identical so a backfilled/lazily-fetched MatchEvent.raw
# looks the same shape as a live-pushed one.
SELECTED_EVENT_KEYS = (
    'event_id', 'code', 'team_id', 'player_id', 'player_name', 'shirt_number',
    'time', 'time_sec', 'period', 'code_fi', 'description', 'location', 'placement', 'team',
)


def status_from_torneopal(status, live_period):
    if status == 'Played':
        return 'played'
    if live_period:
        return 'live'
    return 'scheduled'


def safe_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def parse_date(value):
    try:
        return date_cls.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def parse_location(location):
    if not location:
        return None, None
    x_str, _, y_str = location.partition(',')
    try:
        return float(x_str), float(y_str)
    except ValueError:
        return None, None


def ingest_match_tick(*, match_id, category, season_id, stage, date, status, live_period, period_lengths,
                       team_a_id, team_b_id, team_a_name, team_b_name,
                       score_a, score_b, events):
    """Upserts MatchEvent rows and MatchState for one match snapshot ('tick')
    - either a live client-push, or one historical-backfill pass over an
    already-played match. Returns the new status string ('scheduled'/'live'/
    'played')."""

    new_status = status_from_torneopal(status, live_period)

    state, _ = MatchState.objects.get_or_create(match_id=match_id, defaults={'category': category})
    was_played = state.status == 'played'
    was_scheduled = state.status == 'scheduled'

    shot_situations = compute_shot_situations(events, period_lengths)

    max_abs_time = state.last_event_abs_time or 0
    team_shot_xgot = {'A': [], 'B': []}
    team_xg = {'A': 0.0, 'B': 0.0}
    team_xgot = {'A': 0.0, 'B': 0.0}

    for event in events:
        event_id = event.get('event_id')
        if not event_id:
            continue

        code = event.get('code')
        period = safe_int(event.get('period'))
        time_sec = safe_int(event.get('time_sec'))
        team = event.get('team')

        abs_time = None
        if period is not None and time_sec is not None:
            abs_time = abs_game_time(period, time_sec, period_lengths)
            max_abs_time = max(max_abs_time, abs_time)

        loc_x, loc_y = parse_location(event.get('location'))

        xg = xgot = None
        situation = ''
        if code in SHOT_CODES:
            if loc_x is not None and loc_y is not None:
                result = calc_xg(loc_x, loc_y)
                xg = result['xG']
                xgot = result['xGOT'] if code in ON_TARGET_CODES else 0.0
            else:
                xg = xgot = 0.0
            situation = (
                situation_from_goal_tag(find_goal_tag(events, event)) if code == 'laukausmaali'
                else shot_situations.get(event_id, 'EVEN')
            )
            if team in team_xg:
                team_xg[team] += xg
                team_xgot[team] += xgot
                team_shot_xgot[team].append(xgot)
        elif code in GOALIE_CODES:
            # A goalie's own torjunta/paastetty event carries the same shot
            # coordinates as the shooter's, so xGOT quantifies the quality of
            # the chance the goalie faced (used for goalie GSAx elsewhere).
            if loc_x is not None and loc_y is not None:
                result = calc_xg(loc_x, loc_y)
                xg, xgot = result['xG'], result['xGOT']
            else:
                xg = xgot = 0.0

        MatchEvent.objects.update_or_create(
            match_id=match_id, event_id=event_id,
            defaults={
                'category': category,
                'code': code or '',
                'team': team or '',
                'team_id': event.get('team_id') or '',
                'player_id': event.get('player_id') or '',
                'period': period,
                'time_sec': time_sec,
                'abs_time_sec': abs_time,
                'description': event.get('description') or '',
                'location_x': loc_x,
                'location_y': loc_y,
                'xg': xg,
                'xgot': xgot,
                'situation': situation,
                'raw': event,
            },
        )

    wp_a = wp_b = None
    if team_shot_xgot['A'] or team_shot_xgot['B']:
        wp_a, wp_b = compute_win_probability(team_shot_xgot['A'], team_shot_xgot['B'])

    state.category = category
    state.season_id = season_id or state.season_id
    state.stage = stage or state.stage
    parsed_date = parse_date(date)
    if parsed_date:
        state.date = parsed_date
    state.status = new_status
    state.team_a_id = team_a_id or state.team_a_id
    state.team_b_id = team_b_id or state.team_b_id
    state.team_a_name = team_a_name or state.team_a_name
    state.team_b_name = team_b_name or state.team_b_name
    state.period = safe_int(live_period)
    state.score_a = safe_int(score_a, 0)
    state.score_b = safe_int(score_b, 0)
    state.xg_a = round(team_xg['A'], 3)
    state.xg_b = round(team_xg['B'], 3)
    state.xgot_a = round(team_xgot['A'], 3)
    state.xgot_b = round(team_xgot['B'], 3)
    if wp_a is not None:
        state.wp_a = round(wp_a, 4)
        state.wp_b = round(wp_b, 4)
    state.last_event_abs_time = max_abs_time
    state.save()

    if new_status != 'scheduled':
        now = timezone.now()
        due = state.last_evaluated_at is None or (now - state.last_evaluated_at) >= INSIGHT_EVAL_GATE
        if due:
            evaluate_match_insights(match_id)
            state.last_evaluated_at = now
            state.save(update_fields=['last_evaluated_at'])

    if new_status != 'scheduled' and was_scheduled:
        compute_pregame_analysis(match_id, force=True)

    if new_status == 'played' and not was_played:
        compute_post_game_analysis(match_id)

    return new_status


def ingest_raw_match(match_id, match):
    """Normalizes one raw Torneopal getMatch `match` object's events and
    runs it through ingest_match_tick. Used by both the historical backfill
    command and fetch_and_ingest_match() below. Returns the new status
    string, or None if the match's category_id wasn't recognised."""

    category = CATEGORY_ID_MAP.get(str(match.get('category_id')))
    if category is None:
        return None

    events = [
        {k: e[k] for k in SELECTED_EVENT_KEYS if k in e}
        for e in (match.get('events') or [])
    ]

    return ingest_match_tick(
        match_id=match_id,
        category=category,
        season_id=match.get('season_id'),
        stage=STAGE_GROUP_ID_MAP.get(str(match.get('group_id'))),
        date=match.get('date'),
        status=match.get('status'),
        live_period=match.get('live_period'),
        period_lengths=match.get('period_lengths_sec') or [],
        team_a_id=match.get('team_A_id'),
        team_b_id=match.get('team_B_id'),
        team_a_name=match.get('team_A_name'),
        team_b_name=match.get('team_B_name'),
        score_a=match.get('fs_A'),
        score_b=match.get('fs_B'),
        events=events,
    )


def fetch_and_ingest_match(match_id):
    """Fetches one match fresh from Torneopal and ingests it - the post-game
    lazy-fallback endpoint's recovery path (insights.views.post_game_analysis)
    for a match that was never live-pushed (browser closed early, license
    lapsed mid-game, etc.). Returns the new status string, or None if
    Torneopal has no such match or an unrecognised category_id."""

    match = api_get('getMatch', match_id=match_id).get('match') or {}
    if not match:
        return None
    return ingest_raw_match(match_id, match)
