"""Post-game analysis: a single narrative recap computed once per match.

Same "lead with whatever's most extreme" approach as insights.pregame:
final xG over/underperformance, goalie GSAx, a standout scorer, special-
teams conversion (both power play and penalty kill), and how tonight's xG
compared to each team's own season-to-date average are all scored against
the same HistoricalBaseline population percentiles used throughout the
insight engine (insights.percentiles.percentile_rank) - plus the game's
biggest win-probability swing and the in-game xG margin between the two
teams, neither of which need a baseline since they're inherently a within-
match comparison. Whichever angle scored most extreme leads the recap, with
several more as support; if nothing clears the bar (or no baseline exists
yet for this category/stage), it falls back to a plain score + xG summary.

Each angle has 2-3 equivalent phrasings, picked deterministically per
(match, angle, team) via insights.phrasing.vary, so the same angle doesn't
render identical text across every match it fires for.

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
from .phrasing import vary
from .pregame import _rate_stats, _team_history
from .special_teams import PENALTY_CODE_RE

MIN_POINTS_FOR_STANDOUT = 2  # a post-game "standout" needs at least this many points in the match
MIN_OPP_FOR_RATE = 2  # need at least this many PP/SH opportunities before a rate is meaningful
MIN_XG_MARGIN = 1.5  # in-game xG gap before it's worth reporting on its own
MIN_OWN_AVG_GAMES = 3  # need at least this much prior history before "vs their own average" means anything
MIN_OWN_AVG_DEVIATION = 1.0  # xG swing from their own average before it's worth reporting
MAX_BULLETS = 5  # lead + up to this many support angles


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

    # Each team's own season-to-date form heading into this match, reusing
    # insights.pregame's helpers - lets "vs_own_average" compare tonight's
    # xG to what this specific team normally creates, distinct from
    # xg_over_under (which compares against the league).
    history_a = _team_history(state.team_a_id, state.category, state.stage, before_date=state.date)
    history_b = _team_history(state.team_b_id, state.category, state.stage, before_date=state.date)
    own_rates_a = _rate_stats(state.team_a_id, history_a)
    own_rates_b = _rate_stats(state.team_b_id, history_b)

    baselines = {
        bt: HistoricalBaseline.objects.filter(baseline_type=bt, category=state.category, stage=state.stage).first()
        for bt in (
            'team_gf_axg_per_game', 'goalie_gsax_per_game', 'player_points_per_game',
            'team_pp_perc', 'team_sh_perc',
        )
    }

    candidates = []  # each: {'key': str, 'score': float, 'text': str}

    def seed(key, *parts):
        return ':'.join([str(match_id), key] + [str(p) for p in parts])

    # --- xG over/underperformance vs league ---
    baseline = baselines['team_gf_axg_per_game']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            rank = percentile_rank(facts['gf_axg'], baseline.percentiles)
            luck = facts['gf_axg']
            if luck > 0:
                options = [
                    f"{team_name} finished {luck:.1f} goals above their expected goals tonight.",
                    f"{team_name} were clinical in front of net, {luck:.1f} goals above expected tonight.",
                ]
            else:
                options = [
                    f"{team_name} finished {abs(luck):.1f} goals below their expected goals tonight.",
                    f"{team_name} couldn't buy a goal tonight, finishing {abs(luck):.1f} below their expected goals.",
                ]
            candidates.append({
                'key': 'xg_over_under', 'score': abs(rank - 50) * 2,
                'text': vary(seed('xg_over_under', team_name), options),
            })

    # --- goalie GSAx vs league ---
    baseline = baselines['goalie_gsax_per_game']
    if baseline:
        for team_name, goalie in ((state.team_a_name, goalie_a), (state.team_b_name, goalie_b)):
            if not goalie or not goalie['name']:
                continue
            rank = percentile_rank(goalie['gsax'], baseline.percentiles)
            if goalie['gsax'] > 0:
                options = [
                    f"{goalie['name']} ({team_name}) stood tall in net: {goalie['gsax']:+.2f} goals saved "
                    f"above expected.",
                    f"{goalie['name']} ({team_name}) was the difference tonight, {goalie['gsax']:+.2f} goals "
                    f"saved above expected.",
                ]
            else:
                options = [
                    f"{goalie['name']} ({team_name}) had a night to forget in net: {goalie['gsax']:+.2f} "
                    f"goals saved above expected.",
                    f"{goalie['name']} ({team_name}) couldn't find a rhythm tonight: {goalie['gsax']:+.2f} "
                    f"goals saved above expected.",
                ]
            candidates.append({
                'key': 'goalie', 'score': abs(rank - 50) * 2,
                'text': vary(seed('goalie', team_name), options),
            })

    # --- standout points performance vs league ---
    baseline = baselines['player_points_per_game']
    if baseline:
        for team_name, top in ((state.team_a_name, top_a), (state.team_b_name, top_b)):
            if not top or top['points'] < MIN_POINTS_FOR_STANDOUT:
                continue
            rank = percentile_rank(top['points'], baseline.percentiles)
            options = [
                f"{top['name']} ({team_name}) had a big night: {top['points']} points ({top['goals']} goals).",
                f"{top['name']} ({team_name}) was the standout performer, racking up {top['points']} points "
                f"({top['goals']} goals).",
            ]
            candidates.append({
                'key': 'standout', 'score': max(0.0, rank - 50) * 2,
                'text': vary(seed('standout', team_name), options),
            })

    # --- power play tonight vs league ---
    baseline = baselines['team_pp_perc']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            if facts['PPperc'] is None or facts['PPOpp'] < MIN_OPP_FOR_RATE:
                continue
            rank = percentile_rank(facts['PPperc'], baseline.percentiles)
            options = [
                f"{team_name} were clinical on the power play, converting {facts['PPG']}/{facts['PPOpp']}.",
                f"{team_name}'s power play was the story tonight, scoring on {facts['PPG']} of {facts['PPOpp']} "
                f"chances.",
            ]
            candidates.append({
                'key': 'special_teams_pp', 'score': max(0.0, rank - 50) * 2,
                'text': vary(seed('special_teams_pp', team_name), options),
            })

    # --- penalty kill tonight vs league ---
    baseline = baselines['team_sh_perc']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            if facts['SHperc'] is None or facts['SHOpp'] < MIN_OPP_FOR_RATE:
                continue
            rank = percentile_rank(facts['SHperc'], baseline.percentiles)
            kills = facts['SHOpp'] - facts['PPGA']
            options = [
                f"{team_name}'s penalty kill was excellent tonight, stopping {kills}/{facts['SHOpp']} "
                f"shorthanded situations.",
                f"{team_name} came up big down a player, killing off {kills} of {facts['SHOpp']} penalties.",
            ]
            candidates.append({
                'key': 'special_teams_sh', 'score': max(0.0, rank - 50) * 2,
                'text': vary(seed('special_teams_sh', team_name), options),
            })

    # --- xG vs each team's own season-to-date average (not league-relative) ---
    for team_name, facts, own_rates in (
        (state.team_a_name, facts_a, own_rates_a), (state.team_b_name, facts_b, own_rates_b),
    ):
        if not own_rates or own_rates['games'] < MIN_OWN_AVG_GAMES:
            continue
        diff = facts['xG'] - own_rates['xgf_per_game']
        if abs(diff) < MIN_OWN_AVG_DEVIATION:
            continue
        if diff > 0:
            options = [
                f"{team_name} created far more than usual tonight: {facts['xG']:.2f} xG against their own "
                f"average of {own_rates['xgf_per_game']:.2f} per game.",
                f"This was a season-best-caliber night for {team_name}'s attack: {facts['xG']:.2f} xG, well "
                f"above their usual {own_rates['xgf_per_game']:.2f} per game.",
            ]
        else:
            options = [
                f"{team_name} were held well below their usual output tonight: {facts['xG']:.2f} xG against "
                f"their own average of {own_rates['xgf_per_game']:.2f} per game.",
                f"{team_name}'s attack never got going tonight - {facts['xG']:.2f} xG, down from their usual "
                f"{own_rates['xgf_per_game']:.2f} per game.",
            ]
        candidates.append({
            'key': 'vs_own_average', 'score': min(100.0, abs(diff) * 25),
            'text': vary(seed('vs_own_average', team_name), options),
        })

    # --- in-game xG margin between the two teams (no baseline needed) ---
    xg_margin = facts_a['xG'] - facts_b['xG']
    if abs(xg_margin) >= MIN_XG_MARGIN:
        leader, lead_val, trail_val = (
            (state.team_a_name, facts_a['xG'], facts_b['xG']) if xg_margin > 0
            else (state.team_b_name, facts_b['xG'], facts_a['xG'])
        )
        options = [
            f"{leader} controlled play tonight, out-chancing their opponent {lead_val:.2f} to {trail_val:.2f} "
            f"in expected goals.",
            f"The underlying numbers were one-sided: {leader} held a {lead_val:.2f} to {trail_val:.2f} edge "
            f"in expected goals.",
        ]
        candidates.append({
            'key': 'xg_margin', 'score': min(100.0, abs(xg_margin) * 20),
            'text': vary(seed('xg_margin'), options),
        })

    # --- biggest win-probability swing of the game ---
    swing = _biggest_wp_swing(match_id)
    if swing:
        candidates.append({'key': 'wp_swing', 'score': float(swing.score), 'text': swing.text})

    candidates.sort(key=lambda c: c['score'], reverse=True)
    lead = candidates[0] if candidates else None
    support = [c for c in candidates[1:] if lead is None or c['key'] != lead['key']][:MAX_BULLETS - 1]

    # The score itself isn't an insight - it's already shown on the page.
    if lead:
        text_parts = [lead['text']] + [c['text'] for c in support]
    else:
        text_parts = [f"xG {facts_a['xG']} - {facts_b['xG']}."]

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
        'bullets': text_parts,  # same sentences as `text`, kept separate for bullet-point rendering
    }

    analysis, _ = PostGameAnalysis.objects.update_or_create(
        match_id=match_id,
        defaults={'category': state.category, 'facts': facts, 'text': ' '.join(text_parts)},
    )
    return analysis
