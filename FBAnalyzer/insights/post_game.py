"""Post-game analysis: a single narrative recap computed once per match.

Same "lead with whatever's most extreme" approach as insights.pregame:
final xG over/underperformance, goalie GSAx, a standout scorer, and
special-teams conversion are all scored against the same HistoricalBaseline
population percentiles used throughout the insight engine
(insights.percentiles.percentile_rank), plus the game's biggest win-
probability swing - pulled straight from the Insight log already built up
during the live game (insights.live_insights), if there was one. Whichever
angle scored most extreme leads the recap; if nothing clears the bar (or no
baseline exists yet for this category/stage), it falls back to a plain
score + xG summary.

Triggered eagerly from insights.ingest.ingest_match_tick the moment a live
push sees the match reach 'played' (the full event log is already in hand
at that exact moment). insights.views.post_game_analysis's lazy-fallback
path calls this same function for a match that was never live-pushed -
update_or_create makes re-running it harmless.

Facts use the same field names as FliigaSeasonStats (xGFPP/xGAPP/PPperc/
SHperc/PPG/PPOpp/SHOpp/PPGA team-side, see
accounts/management/commands/compute_fliiga_stats.py) so the frontend can
reuse the same rendering/legend conventions as the season stats table.
"""

from collections import defaultdict

from .event_codes import ASSIST_CODE, GOAL_AGAINST_CODE, GOAL_CODE, GOALIE_CODES, ON_TARGET_CODES, SHOT_CODES
from .models import HistoricalBaseline, Insight, MatchEvent, MatchState, PostGameAnalysis
from .percentiles import percentile_rank
from .special_teams import PENALTY_CODE_RE

MIN_POINTS_FOR_STANDOUT = 2  # a post-game "standout" needs at least this many points in the match
MIN_OPP_FOR_RATE = 2  # need at least this many PP opportunities before a rate is meaningful


def is_penalty(code):
    return bool(PENALTY_CODE_RE.match(code or ''))


def _round2(value):
    return round(value, 2)


def _team_facts(events, shots, team, opp_team, score_for):
    team_shots = [s for s in shots if s.team == team]
    opp_shots = [s for s in shots if s.team == opp_team]

    xgf = sum(float(s.xg or 0) for s in team_shots)
    gf = sum(1 for s in team_shots if s.code == GOAL_CODE)
    pp_goals = sum(1 for s in team_shots if s.code == GOAL_CODE and s.situation == 'PP')
    pp_goals_against = sum(1 for s in opp_shots if s.code == GOAL_CODE and s.situation == 'PP')
    pp_opp = sum(1 for e in events if e.team == opp_team and is_penalty(e.code))
    sh_opp = sum(1 for e in events if e.team == team and is_penalty(e.code))

    return {
        'score': score_for,
        'xG': _round2(xgf), 'xGOT': _round2(sum(float(s.xgot or 0) for s in team_shots)),
        'xGFPP': _round2(sum(float(s.xg or 0) for s in team_shots if s.situation == 'PP')),
        'xGAPP': _round2(sum(float(s.xg or 0) for s in opp_shots if s.situation == 'PP')),
        'gf_axg': _round2(gf - xgf),
        'shots': len(team_shots),
        'shotsOnTarget': sum(1 for s in team_shots if s.code in ON_TARGET_CODES),
        'PPG': pp_goals, 'PPOpp': pp_opp, 'SHOpp': sh_opp, 'PPGA': pp_goals_against,
        'PPperc': _round2(pp_goals / pp_opp) if pp_opp else None,
        'SHperc': _round2(1 - pp_goals_against / sh_opp) if sh_opp else None,
    }


def _top_scorer(events, shots, team):
    """Points (goals + assists) leader for one team in this match."""
    players = defaultdict(lambda: {'points': 0, 'goals': 0, 'name': ''})
    for s in shots:
        if s.team == team and s.code == GOAL_CODE and s.player_id:
            p = players[s.player_id]
            p['points'] += 1
            p['goals'] += 1
            p['name'] = p['name'] or (s.raw or {}).get('player_name', '')
    for e in events:
        if e.team == team and e.code == ASSIST_CODE and e.player_id:
            p = players[e.player_id]
            p['points'] += 1
            p['name'] = p['name'] or (e.raw or {}).get('player_name', '')
    if not players:
        return None
    return max(players.values(), key=lambda p: p['points'])


def _goalie(events, team):
    """The goalie who faced the most shots for one team in this match, and
    their final GSAx. e.team on a torjunta/paastetty event is the goalie's
    own (defending) side, confirmed against real Torneopal data."""
    goalies = defaultdict(lambda: {'xgot': 0.0, 'ga': 0, 'faced': 0, 'name': ''})
    for e in events:
        if e.code in GOALIE_CODES and e.team == team and e.player_id:
            g = goalies[e.player_id]
            g['xgot'] += float(e.xgot or 0)
            g['faced'] += 1
            g['name'] = g['name'] or (e.raw or {}).get('player_name', '')
            if e.code == GOAL_AGAINST_CODE:
                g['ga'] += 1
    if not goalies:
        return None
    starter = max(goalies.values(), key=lambda g: g['faced'])
    return {'name': starter['name'], 'gsax': _round2(starter['xgot'] - starter['ga'])}


def _biggest_wp_swing(match_id):
    return (
        Insight.objects.filter(match_id=match_id, insight_type='wp_swing')
        .exclude(text='').order_by('-score').first()
    )


def compute_post_game_analysis(match_id):
    state = MatchState.objects.filter(match_id=match_id).first()
    if state is None:
        return None

    events = list(MatchEvent.objects.filter(match_id=match_id))
    shots = [e for e in events if e.code in SHOT_CODES]

    facts_a = _team_facts(events, shots, 'A', 'B', state.score_a)
    facts_b = _team_facts(events, shots, 'B', 'A', state.score_b)
    top_a = _top_scorer(events, shots, 'A')
    top_b = _top_scorer(events, shots, 'B')
    goalie_a = _goalie(events, 'A')
    goalie_b = _goalie(events, 'B')

    baselines = {
        bt: HistoricalBaseline.objects.filter(baseline_type=bt, category=state.category, stage=state.stage).first()
        for bt in ('team_gf_axg_per_game', 'goalie_gsax_per_game', 'player_points_per_game', 'team_pp_perc')
    }

    candidates = []  # each: {'key': str, 'score': float, 'text': str}

    baseline = baselines['team_gf_axg_per_game']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            rank = percentile_rank(facts['gf_axg'], baseline.percentiles)
            direction = 'above' if facts['gf_axg'] > 0 else 'below'
            candidates.append({
                'key': 'xg_over_under', 'score': abs(rank - 50) * 2,
                'text': f"{team_name} finished {abs(facts['gf_axg']):.1f} goals {direction} their expected goals tonight.",
            })

    baseline = baselines['goalie_gsax_per_game']
    if baseline:
        for team_name, goalie in ((state.team_a_name, goalie_a), (state.team_b_name, goalie_b)):
            if not goalie or not goalie['name']:
                continue
            rank = percentile_rank(goalie['gsax'], baseline.percentiles)
            quality = 'stood tall' if goalie['gsax'] > 0 else 'had a night to forget'
            candidates.append({
                'key': 'goalie', 'score': abs(rank - 50) * 2,
                'text': f"{goalie['name']} ({team_name}) {quality} in net: {goalie['gsax']:+.2f} goals saved above expected.",
            })

    baseline = baselines['player_points_per_game']
    if baseline:
        for team_name, top in ((state.team_a_name, top_a), (state.team_b_name, top_b)):
            if not top or top['points'] < MIN_POINTS_FOR_STANDOUT:
                continue
            rank = percentile_rank(top['points'], baseline.percentiles)
            candidates.append({
                'key': 'standout', 'score': max(0.0, rank - 50) * 2,
                'text': f"{top['name']} ({team_name}) had a big night: {top['points']} points ({top['goals']} goals).",
            })

    baseline = baselines['team_pp_perc']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            if facts['PPperc'] is None or facts['PPOpp'] < MIN_OPP_FOR_RATE:
                continue
            rank = percentile_rank(facts['PPperc'], baseline.percentiles)
            candidates.append({
                'key': 'special_teams', 'score': max(0.0, rank - 50) * 2,
                'text': f"{team_name} were clinical on the power play, converting {facts['PPG']}/{facts['PPOpp']}.",
            })

    swing = _biggest_wp_swing(match_id)
    if swing:
        candidates.append({'key': 'wp_swing', 'score': float(swing.score), 'text': swing.text})

    candidates.sort(key=lambda c: c['score'], reverse=True)
    lead = candidates[0] if candidates else None
    support = [c for c in candidates[1:] if lead is None or c['key'] != lead['key']][:2]

    score_line = f"{state.team_a_name} {state.score_a} - {state.score_b} {state.team_b_name}."
    if lead:
        text_parts = [score_line, lead['text']] + [c['text'] for c in support]
    else:
        text_parts = [score_line, f"xG {facts_a['xG']} - {facts_b['xG']}."]

    facts = {
        'team_a': {
            'id': state.team_a_id, 'name': state.team_a_name, **facts_a,
            'top_scorer': top_a, 'goalie': goalie_a,
        },
        'team_b': {
            'id': state.team_b_id, 'name': state.team_b_name, **facts_b,
            'top_scorer': top_b, 'goalie': goalie_b,
        },
        'lead_angle': lead['key'] if lead else 'summary',
    }

    analysis, _ = PostGameAnalysis.objects.update_or_create(
        match_id=match_id,
        defaults={'category': state.category, 'facts': facts, 'text': ' '.join(text_parts)},
    )
    return analysis
