"""Live in-game insight evaluation, called from insights.ingest.ingest_match_tick
once per match every ~60s (see MatchState.last_evaluated_at, the gate that
keeps this from running on every 10s client-push tick).

Every insight type here reduces to the same shape: take some current, live,
cumulative value for this match and compare it against the matching
HistoricalBaseline (see insights.management.commands.compute_baselines) -
a value far from that baseline's p50 is "notable" regardless of whether it's
good or bad. xg_momentum and wp_swing don't need a baseline: they're
inherently a within-match comparison (this window vs that window, this tick's
win probability vs the last).

Insight is an append-only log (many rows per match, see models.py), so a
light per-(match, insight_type) cooldown keeps a persistently-extreme stat
from re-inserting an almost-identical row every single evaluation cycle.
wp_swing is the one exception: it always logs a snapshot (score 0, no text)
even when not notable, because the next evaluation needs a true previous
wp_a to diff against - without that, a skipped tick would make the following
one look like a bigger swing than it really was.
"""

from collections import defaultdict
from datetime import timedelta

from django.utils import timezone

from .event_codes import ASSIST_CODE, GOAL_AGAINST_CODE, GOAL_CODE, GOALIE_CODES, SHOT_CODES
from .models import HistoricalBaseline, Insight, MatchEvent, MatchState
from .percentiles import percentile_rank
from .special_teams import PENALTY_CODE_RE

NOTABLE_THRESHOLD = 60  # on the 0-100 "score" scale computed below
COOLDOWN_SECONDS = 300  # don't repeat the same (match, insight_type) more than once per 5 min
TRAILING_WINDOW_SEC = 600  # 10 minutes, for xg_momentum
MOMENTUM_MIN_GAP = 0.5  # xG gap over the trailing window before it's worth reporting at all
MIN_OPP_FOR_RATE = 2  # need at least this many PP opportunities before a rate is meaningful


def is_penalty(code):
    return bool(PENALTY_CODE_RE.match(code or ''))


def evaluate_match_insights(match_id):
    """Evaluates every candidate insight type for this match's current state
    and persists whichever clear the notability bar. Returns the list of
    newly-created (notable) Insight rows."""

    state = MatchState.objects.filter(match_id=match_id).first()
    if state is None or not state.team_a_id or not state.team_b_id:
        return []

    events = list(MatchEvent.objects.filter(match_id=match_id))
    shots = [e for e in events if e.code in SHOT_CODES]
    created = []

    baselines = {
        bt: HistoricalBaseline.objects.filter(
            baseline_type=bt, category=state.category, stage=state.stage,
        ).first()
        for bt in (
            'team_gf_axg_per_game', 'team_pp_perc', 'goalie_gsax_per_game', 'player_points_per_game',
        )
    }

    def maybe_create(insight_type, score, payload, text):
        if score < NOTABLE_THRESHOLD:
            return
        recent = Insight.objects.filter(
            match_id=match_id, insight_type=insight_type,
            created_at__gte=timezone.now() - timedelta(seconds=COOLDOWN_SECONDS),
        ).exists()
        if recent:
            return
        insight = Insight.objects.create(
            match_id=match_id, insight_type=insight_type,
            payload=payload, text=text, score=round(score, 3),
        )
        created.append(insight)

    # --- xg_over_under: goals vs expected, per team, so far this match ---
    baseline = baselines['team_gf_axg_per_game']
    if baseline:
        for side, team_name in (('A', state.team_a_name), ('B', state.team_b_name)):
            team_shots = [s for s in shots if s.team == side]
            gf = sum(1 for s in team_shots if s.code == GOAL_CODE)
            xgf = sum(float(s.xg or 0) for s in team_shots)
            gf_axg = gf - xgf
            rank = percentile_rank(gf_axg, baseline.percentiles)
            score = abs(rank - 50) * 2
            direction = 'above' if gf_axg > 0 else 'below'
            maybe_create(
                'xg_over_under', score,
                {
                    'team': team_name, 'side': side, 'gf': gf,
                    'xgf': round(xgf, 2), 'gf_axg': round(gf_axg, 2), 'percentile': round(rank, 1),
                },
                f"{team_name} are {abs(round(gf_axg, 1))} goals {direction} their expected goals so far tonight.",
            )

    # --- goalie_gsax: goalie performance vs baseline, so far this match ---
    baseline = baselines['goalie_gsax_per_game']
    if baseline:
        goalies = defaultdict(lambda: {'xgot': 0.0, 'ga': 0, 'name': ''})
        for e in events:
            if e.code in GOALIE_CODES and e.player_id:
                g = goalies[e.player_id]
                g['xgot'] += float(e.xgot or 0)
                g['name'] = g['name'] or (e.raw or {}).get('player_name', '')
                if e.code == GOAL_AGAINST_CODE:
                    g['ga'] += 1
        for player_id, g in goalies.items():
            gsax = g['xgot'] - g['ga']
            rank = percentile_rank(gsax, baseline.percentiles)
            score = abs(rank - 50) * 2
            quality = 'stellar' if gsax > 0 else 'rough'
            maybe_create(
                'goalie_gsax', score,
                {'player_id': player_id, 'name': g['name'], 'gsax': round(gsax, 2), 'percentile': round(rank, 1)},
                f"{g['name']} is having a {quality} night in net: {round(gsax, 2):+} goals saved above expected.",
            )

    # --- standout_performer: player points so far vs the league's per-game baseline ---
    baseline = baselines['player_points_per_game']
    if baseline:
        players = defaultdict(lambda: {'points': 0, 'name': ''})
        for e in events:
            if e.player_id and e.code in (GOAL_CODE, ASSIST_CODE):
                p = players[e.player_id]
                p['points'] += 1
                p['name'] = p['name'] or (e.raw or {}).get('player_name', '')
        for player_id, p in players.items():
            rank = percentile_rank(p['points'], baseline.percentiles)
            score = max(0.0, rank - 50) * 2  # only "standout" on the high side
            maybe_create(
                'standout_performer', score,
                {'player_id': player_id, 'name': p['name'], 'points': p['points'], 'percentile': round(rank, 1)},
                f"{p['name']} already has {p['points']} points tonight - well above a typical full game.",
            )

    # --- special_teams_rate: in-game PP conversion vs the league's baseline ---
    baseline = baselines['team_pp_perc']
    if baseline:
        pp_goals_a = sum(1 for s in shots if s.team == 'A' and s.code == GOAL_CODE and s.situation == 'PP')
        pp_goals_b = sum(1 for s in shots if s.team == 'B' and s.code == GOAL_CODE and s.situation == 'PP')
        pp_opp_a = sum(1 for e in events if e.team == 'B' and is_penalty(e.code))
        pp_opp_b = sum(1 for e in events if e.team == 'A' and is_penalty(e.code))
        for team_name, pp_goals, pp_opp in (
            (state.team_a_name, pp_goals_a, pp_opp_a), (state.team_b_name, pp_goals_b, pp_opp_b),
        ):
            if pp_opp < MIN_OPP_FOR_RATE:
                continue
            rate = pp_goals / pp_opp
            rank = percentile_rank(rate, baseline.percentiles)
            score = max(0.0, rank - 50) * 2
            maybe_create(
                'special_teams_rate', score,
                {'team': team_name, 'pp_goals': pp_goals, 'pp_opp': pp_opp, 'rate': round(rate, 2), 'percentile': round(rank, 1)},
                f"{team_name} are converting power plays at {round(rate * 100)}% tonight "
                f"({pp_goals}/{pp_opp}) - well above the league rate.",
            )

    # --- xg_momentum: trailing-window xG gap between the two teams ---
    if events:
        max_time = max((e.abs_time_sec or 0) for e in events)
        window_start = max_time - TRAILING_WINDOW_SEC
        trailing = [s for s in shots if (s.abs_time_sec or 0) >= window_start]
        xg_a = sum(float(s.xg or 0) for s in trailing if s.team == 'A')
        xg_b = sum(float(s.xg or 0) for s in trailing if s.team == 'B')
        gap = xg_a - xg_b
        if abs(gap) >= MOMENTUM_MIN_GAP:
            leader, xg_lead, xg_trail = (
                (state.team_a_name, xg_a, xg_b) if gap > 0 else (state.team_b_name, xg_b, xg_a)
            )
            score = min(100.0, abs(gap) * 40)
            maybe_create(
                'xg_momentum', score,
                {
                    'team': leader, 'xg_leading': round(xg_lead, 2), 'xg_trailing': round(xg_trail, 2),
                    'window_sec': TRAILING_WINDOW_SEC,
                },
                f"{leader} have controlled play over the last {TRAILING_WINDOW_SEC // 60} minutes: "
                f"{round(xg_lead, 2)} to {round(xg_trail, 2)} in expected goals.",
            )

    # --- wp_swing: change in win probability since the last evaluation ---
    if state.wp_a is not None:
        last = Insight.objects.filter(match_id=match_id, insight_type='wp_swing').order_by('-created_at').first()
        prev_wp_a = float(last.payload.get('wp_a', 0.5)) if last else 0.5
        delta = float(state.wp_a) - prev_wp_a
        score = min(100.0, abs(delta) * 150)
        gainer = state.team_a_name if delta > 0 else state.team_b_name
        text = (
            f"Big swing: {gainer}'s win probability just moved {abs(round(delta * 100))} points."
            if score >= NOTABLE_THRESHOLD else ''
        )
        insight = Insight.objects.create(
            match_id=match_id, insight_type='wp_swing', score=round(score, 3),
            payload={'wp_a': float(state.wp_a), 'wp_b': float(state.wp_b), 'delta': round(delta, 3)},
            text=text,
        )
        if text:
            created.append(insight)

    return created
