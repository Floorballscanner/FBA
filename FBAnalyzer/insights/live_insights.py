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
from .models import HistoricalBaseline, Insight, MatchEvent, MatchLineup, MatchState
from .percentiles import percentile_rank
from .special_teams import PENALTY_CODE_RE

NOTABLE_THRESHOLD = 60  # on the 0-100 "score" scale computed below
COOLDOWN_SECONDS = 300  # don't repeat the same (match, insight_type) more than once per 5 min
TRAILING_WINDOW_SEC = 600  # 10 minutes, for xg_momentum
MOMENTUM_MIN_GAP = 0.5  # xG gap over the trailing window before it's worth reporting at all
MOMENTUM_SCORE_MULT = 60  # gap * this = score; 60 makes a 1.0 gap notable (~90th percentile of real
# trailing-window snapshots this season - the old value of 40 needed a 1.5 gap, ~98th percentile,
# which is why this fired exactly once across 1241 matches with any insight at all.
WP_SWING_SCORE_MULT = 400  # delta * this = score; 400 makes a 0.15 swing notable (down from needing
# 0.4, which - per real win-probability data - this season's biggest swing (0.375) never even reached,
# so wp_swing fired zero notable times in 2026-2027 despite 1060 ticks logged.
MIN_OPP_FOR_RATE = 2  # need at least this many PP opportunities before a rate is meaningful
STANDOUT_MIN_GOALS = 3  # or...
STANDOUT_MIN_POINTS = 5  # ...this many points (goals+assists), before standout_performer even considers firing -
# the percentile rank alone let a single point (an 86.6th percentile night by itself, per real production
# data) fire on literally the first goal or assist of the match every time.

AGAINST_ODDS_MIN_GAP = 0.15  # (0.5 - leading team's wp) before this fires - from real 2026-2027 mid-game
# snapshots (n=167 "team is leading" moments), the leading team was the model's underdog by >=15 points in
# ~11% of them (18/167) - roughly the 89th percentile of any leading moment, occasional and real.
AGAINST_ODDS_SCORE_MULT = 400  # gap * this = score; 400 makes a 0.15 gap notable (same scale as WP_SWING_SCORE_MULT)

LINE_XG_GAP_MIN = 1.5  # 5v5-only xG gap between the same-numbered line on both teams before it's notable -
# from real 2026-2027 line-pairings (lines 1-3, n=42): median 0.72, p75 1.20, p90 1.60, so 1.5 sits ~85-90th
# percentile. PP/SH/6V5 shots are excluded so this reflects pure 5v5 play, not special teams.
LINE_SCORE_MULT = 40  # gap * this = score; 40 makes a 1.5 xG gap score 60

SPECIAL_TEAMS_BATTLE_MIN_NET = 2  # net PP goal differential, head-to-head - from real data (median 0, p90 1
# across this season's 14 matches) a net of 2+ hasn't happened yet, so it's a clear signal when it does.
SPECIAL_TEAMS_BATTLE_SCORE_MULT = 40  # net * this = score; 40 makes a net of 2 score 80

PENALTY_DISCIPLINE_MIN_GAP = 3  # penalty-count gap between the two teams - from real data (median 1, p90 2,
# p95 3, max 3 across this season's 14 matches) a gap of 3 sits at the very top of what's been observed.
PENALTY_DISCIPLINE_SCORE_MULT = 20  # gap * this = score; 20 makes a gap of 3 score 60

GOALIE_DUEL_MIN_FACED = 3  # shots faced, before a starting goalie's GSAx is meaningful enough to compare
GOALIE_DUEL_MIN_GAP = 5.0  # GSAx gap between the two starters - from real data (median 1.21, p75 3.88,
# p90 5.93, p95 6.41 across this season's 14 matches) 5.0 sits right around the 90th percentile.
GOALIE_DUEL_SCORE_MULT = 12  # gap * this = score; 12 makes a gap of 5.0 score 60


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
    goalies = defaultdict(lambda: {'xgot': 0.0, 'ga': 0, 'name': '', 'team': '', 'faced': 0})
    for e in events:
        if e.code in GOALIE_CODES and e.player_id:
            g = goalies[e.player_id]
            g['xgot'] += float(e.xgot or 0)
            g['name'] = g['name'] or (e.raw or {}).get('player_name', '')
            g['team'] = g['team'] or e.team
            g['faced'] += 1
            if e.code == GOAL_AGAINST_CODE:
                g['ga'] += 1

    baseline = baselines['goalie_gsax_per_game']
    if baseline:
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

    # --- goalie_duel: head-to-head GSAx between the two starting goalies (not vs the league baseline) ---
    starter_ids = set(MatchLineup.objects.filter(
        match_id=match_id, role='MV', is_starter=True,
    ).values_list('player_id', flat=True))
    starters = {
        pid: g for pid, g in goalies.items()
        if pid in starter_ids and g['name'] and g['faced'] >= GOALIE_DUEL_MIN_FACED
    }
    if len(starters) == 2:
        (_, g_a), (_, g_b) = starters.items()
        gap = (g_a['xgot'] - g_a['ga']) - (g_b['xgot'] - g_b['ga'])
        if abs(gap) >= GOALIE_DUEL_MIN_GAP:
            better, worse = (g_a, g_b) if gap > 0 else (g_b, g_a)
            score = min(100.0, abs(gap) * GOALIE_DUEL_SCORE_MULT)
            maybe_create(
                'goalie_duel', score,
                {'better_goalie': better['name'], 'worse_goalie': worse['name'], 'gsax_gap': round(abs(gap), 2)},
                f"{better['name']} has been the better goalie tonight: "
                f"{round(abs(gap), 2):+} GSAx compared to {worse['name']}.",
            )

    # --- standout_performer: player points so far vs the league's per-game baseline ---
    baseline = baselines['player_points_per_game']
    if baseline:
        players = defaultdict(lambda: {'points': 0, 'goals': 0, 'name': ''})
        for e in events:
            if e.player_id and e.code in (GOAL_CODE, ASSIST_CODE):
                p = players[e.player_id]
                p['points'] += 1
                if e.code == GOAL_CODE:
                    p['goals'] += 1
                p['name'] = p['name'] or (e.raw or {}).get('player_name', '')
        for player_id, p in players.items():
            if not p['name']:
                continue  # placeholder/system entries (e.g. player_id '1') carry no real name
            if p['goals'] < STANDOUT_MIN_GOALS and p['points'] < STANDOUT_MIN_POINTS:
                continue
            rank = percentile_rank(p['points'], baseline.percentiles)
            score = max(0.0, rank - 50) * 2  # only "standout" on the high side
            maybe_create(
                'standout_performer', score,
                {'player_id': player_id, 'name': p['name'], 'points': p['points'], 'goals': p['goals'], 'percentile': round(rank, 1)},
                f"{p['name']} already has {p['points']} points tonight - well above a typical full game.",
            )

    # --- special teams: in-game PP goals/opportunities, shared by special_teams_rate/battle/discipline below ---
    pp_goals_a = sum(1 for s in shots if s.team == 'A' and s.code == GOAL_CODE and s.situation == 'PP')
    pp_goals_b = sum(1 for s in shots if s.team == 'B' and s.code == GOAL_CODE and s.situation == 'PP')
    pp_opp_a = sum(1 for e in events if e.team == 'B' and is_penalty(e.code))
    pp_opp_b = sum(1 for e in events if e.team == 'A' and is_penalty(e.code))

    # --- special_teams_rate: in-game PP conversion vs the league's baseline ---
    baseline = baselines['team_pp_perc']
    if baseline:
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

    # --- special_teams_battle: net PP goal differential between the two teams, head-to-head ---
    if pp_opp_a + pp_opp_b >= MIN_OPP_FOR_RATE * 2:
        net = pp_goals_a - pp_goals_b
        if abs(net) >= SPECIAL_TEAMS_BATTLE_MIN_NET:
            leader = state.team_a_name if net > 0 else state.team_b_name
            score = min(100.0, abs(net) * SPECIAL_TEAMS_BATTLE_SCORE_MULT)
            maybe_create(
                'special_teams_battle', score,
                {'leader': leader, 'pp_goals_a': pp_goals_a, 'pp_goals_b': pp_goals_b},
                f"Special teams are deciding this one: {leader} lead the power-play battle "
                f"{max(pp_goals_a, pp_goals_b)} to {min(pp_goals_a, pp_goals_b)}.",
            )

    # --- penalty_discipline: one team taking meaningfully more penalties than the other ---
    # team A's own penalty count is pp_opp_b (B's resulting PP opportunities), and vice versa.
    penalty_gap = pp_opp_b - pp_opp_a
    if abs(penalty_gap) >= PENALTY_DISCIPLINE_MIN_GAP:
        worse_team, better_team = (
            (state.team_a_name, state.team_b_name) if penalty_gap > 0 else (state.team_b_name, state.team_a_name)
        )
        score = min(100.0, abs(penalty_gap) * PENALTY_DISCIPLINE_SCORE_MULT)
        maybe_create(
            'penalty_discipline', score,
            {
                'team': worse_team, 'opponent': better_team,
                'penalties': max(pp_opp_a, pp_opp_b), 'opponent_penalties': min(pp_opp_a, pp_opp_b),
            },
            f"{worse_team} have taken {abs(penalty_gap)} more penalties than {better_team} tonight - "
            f"discipline is becoming a story.",
        )

    # --- against_the_odds: leading on the scoreboard despite a worse win probability ---
    if state.wp_a is not None and state.score_a != state.score_b:
        if state.score_a > state.score_b:
            leading_team, leading_score, leading_wp = state.team_a_name, state.score_a, float(state.wp_a)
            trailing_team, trailing_score = state.team_b_name, state.score_b
        else:
            leading_team, leading_score, leading_wp = state.team_b_name, state.score_b, float(state.wp_b)
            trailing_team, trailing_score = state.team_a_name, state.score_a
        gap = 0.5 - leading_wp
        if gap >= AGAINST_ODDS_MIN_GAP:
            score = min(100.0, gap * AGAINST_ODDS_SCORE_MULT)
            maybe_create(
                'against_the_odds', score,
                {
                    'leading_team': leading_team, 'trailing_team': trailing_team,
                    'leading_score': leading_score, 'trailing_score': trailing_score,
                    'leading_wp': round(leading_wp, 3),
                },
                f"{trailing_team} are the model's favorite despite trailing {leading_team} "
                f"{leading_score}-{trailing_score}: {leading_team}'s win probability is only "
                f"{round(leading_wp * 100)}%.",
            )

    # --- line_battle: 5v5-only xG/goal gap between the same-numbered line on each team ---
    lineups = {
        lu.player_id: (lu.team_id, lu.line_number)
        for lu in MatchLineup.objects.filter(match_id=match_id).exclude(role='MV')
        if lu.line_number and 1 <= lu.line_number <= 3
    }
    if lineups:
        even_shots = [s for s in shots if s.situation == 'EVEN']
        lines = defaultdict(lambda: defaultdict(lambda: {'xg': 0.0, 'goals': 0}))
        for s in even_shots:
            entry = lineups.get(s.player_id)
            if not entry:
                continue
            team_id, line_number = entry
            cell = lines[team_id][line_number]
            cell['xg'] += float(s.xg or 0)
            if s.code == GOAL_CODE:
                cell['goals'] += 1
        team_names = {state.team_a_id: state.team_a_name, state.team_b_id: state.team_b_name}
        if state.team_a_id in lines and state.team_b_id in lines:
            for line_number in (1, 2, 3):
                cell_a = lines[state.team_a_id].get(line_number)
                cell_b = lines[state.team_b_id].get(line_number)
                if not cell_a or not cell_b:
                    continue
                gap = cell_a['xg'] - cell_b['xg']
                if abs(gap) < LINE_XG_GAP_MIN:
                    continue
                leader_id, trailer_id = (
                    (state.team_a_id, state.team_b_id) if gap > 0 else (state.team_b_id, state.team_a_id)
                )
                leader_cell, trailer_cell = (cell_a, cell_b) if gap > 0 else (cell_b, cell_a)
                score = min(100.0, abs(gap) * LINE_SCORE_MULT)
                maybe_create(
                    'line_battle', score,
                    {
                        'line_number': line_number, 'team': team_names[leader_id], 'opponent': team_names[trailer_id],
                        'xg_for': round(leader_cell['xg'], 2), 'xg_against': round(trailer_cell['xg'], 2),
                        'goals_for': leader_cell['goals'], 'goals_against': trailer_cell['goals'],
                    },
                    f"{team_names[leader_id]}'s Line {line_number} is outperforming {team_names[trailer_id]}'s "
                    f"Line {line_number} at 5v5: {round(leader_cell['xg'], 2)} to {round(trailer_cell['xg'], 2)} "
                    f"in expected goals.",
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
            score = min(100.0, abs(gap) * MOMENTUM_SCORE_MULT)
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
        score = min(100.0, abs(delta) * WP_SWING_SCORE_MULT)
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
