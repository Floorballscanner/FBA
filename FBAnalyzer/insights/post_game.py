"""Post-game analysis: a single narrative recap computed once per match.

Same "lead with whatever's most extreme" approach as insights.pregame:
final xG over/underperformance, goalie GSAx, a standout scorer, special-
teams conversion (both power play and penalty kill), shots that missed the
target despite good underlying chances, how this game's xG compared to
each team's own season-to-date average, and whether the scoreboard result
matched the underlying xG battle are all scored against the same
HistoricalBaseline population percentiles used throughout the insight
engine (insights.percentiles.percentile_rank) where a baseline applies -
plus the game's biggest win-probability swing and the in-game xG margin
between the two teams, neither of which need a baseline since they're
inherently a within-match comparison. Whichever angle scored most extreme
leads the recap, with several more as support; if nothing clears the bar
(or no baseline exists yet for this category/stage), it falls back to a
plain score + xG summary.

Angles that compare a value against a HistoricalBaseline also require a
minimum absolute magnitude (MIN_GF_AXG etc.) before they're considered at
all - a percentile can be "extreme" for a tiny, practically-meaningless
difference if the league's own distribution is narrow or skewed (e.g. most
teams already running well below their modeled xG - see xg_model.py's
MAX_Y history), so percentile rank alone isn't enough to call something a
genuine insight.

Each angle has 3-5 equivalent phrasings, picked deterministically per
(match, angle, team) via insights.phrasing.vary, so the same angle doesn't
render identical text across every match it fires for. Deliberately light
on "tonight"/"night" - since every angle here is inherently about this one
match, having every single phrasing option say "tonight" made a game's
whole set of bullets read as repetitive even though the underlying facts
differed.

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
MIN_GF_AXG = 1.0  # goals-vs-xG swing before it's worth calling out - a 0.1 gap isn't a real story
MIN_XG_FOR_WASTED = 3.0  # need real shot volume before an off-target rate means anything
WASTED_RATIO_THRESHOLD = 0.55  # fraction of a team's xG that came from shots that never hit the target
MIN_UPSET_XG_GAP = 1.0  # xG gap before "the team that lost actually had the better chances" is worth saying
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


def _percentile_score(value, baseline, one_sided=False):
    """0-100+ "how extreme is this" score from a HistoricalBaseline. Extends
    past the raw percentile-rank scale for values beyond the observed
    min/max instead of hard-capping at 100 - with several candidates per
    game each capable of clamping to exactly 100 (a value past the smallish
    current baseline sample's range is not unusual), leaving them tied would
    mean ties get broken by candidate insertion order, silently burying
    whichever angle happens to be computed later in this function (e.g.
    wasted_chances/upset) behind an equally-"maxed-out" but less extreme
    percentile candidate. one_sided=True for angles where only the high end
    is noteworthy (a low PP%/points total isn't an insight)."""
    p = baseline.percentiles
    rank = percentile_rank(value, p)
    score = (max(0.0, rank - 50) if one_sided else abs(rank - 50)) * 2
    spread = (p['max'] - p['min']) or 1  # whole-population spread - stable even when a tail is narrow
    if value > p['max']:
        score += min(30.0, (value - p['max']) / spread * 30)
    elif not one_sided and value < p['min']:
        score += min(30.0, (p['min'] - value) / spread * 30)
    return score


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
    # insights.pregame's helpers - lets "vs_own_average" compare this game's
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
            luck = facts['gf_axg']
            if abs(luck) < MIN_GF_AXG:
                continue
            if luck > 0:
                options = [
                    f"{team_name} finished {luck:.1f} goals above their expected goals.",
                    f"{team_name} were clinical in front of net, {luck:.1f} goals above expected.",
                    f"{team_name} made the most of their chances, finishing {luck:.1f} goals above expected.",
                    f"Finishing carried {team_name} - {luck:.1f} goals above what the chances suggested.",
                ]
            else:
                options = [
                    f"{team_name} finished {abs(luck):.1f} goals below their expected goals.",
                    f"{team_name} couldn't buy a goal, finishing {abs(luck):.1f} below their expected goals.",
                    f"{team_name} left plenty on the table, {abs(luck):.1f} goals below what their chances "
                    f"deserved.",
                    f"The finishing let {team_name} down - {abs(luck):.1f} goals below expected.",
                ]
            candidates.append({
                'key': 'xg_over_under', 'score': _percentile_score(luck, baseline),
                'text': vary(seed('xg_over_under', team_name), options),
            })

    # --- goalie GSAx vs league ---
    baseline = baselines['goalie_gsax_per_game']
    if baseline:
        for team_name, goalie in ((state.team_a_name, goalie_a), (state.team_b_name, goalie_b)):
            if not goalie or not goalie['name']:
                continue
            if goalie['gsax'] > 0:
                options = [
                    f"{goalie['name']} ({team_name}) stood tall in net: {goalie['gsax']:+.2f} goals saved "
                    f"above expected.",
                    f"{goalie['name']} ({team_name}) was the difference: {goalie['gsax']:+.2f} goals saved "
                    f"above expected.",
                    f"{goalie['name']} kept {team_name} in the game: {goalie['gsax']:+.2f} goals saved above "
                    f"expected.",
                    f"A big performance in net from {goalie['name']} ({team_name}): {goalie['gsax']:+.2f} "
                    f"goals saved above expected.",
                ]
            else:
                options = [
                    f"{goalie['name']} ({team_name}) struggled in net: {goalie['gsax']:+.2f} goals saved "
                    f"above expected.",
                    f"{goalie['name']} ({team_name}) couldn't find a rhythm: {goalie['gsax']:+.2f} goals "
                    f"saved above expected.",
                    f"It wasn't {goalie['name']}'s best game for {team_name}: {goalie['gsax']:+.2f} goals "
                    f"saved above expected.",
                    f"{team_name} didn't get much help in net - {goalie['name']} finished at "
                    f"{goalie['gsax']:+.2f} GSAx.",
                ]
            candidates.append({
                'key': 'goalie', 'score': _percentile_score(goalie['gsax'], baseline),
                'text': vary(seed('goalie', team_name), options),
            })

    # --- standout points performance vs league ---
    baseline = baselines['player_points_per_game']
    if baseline:
        for team_name, top in ((state.team_a_name, top_a), (state.team_b_name, top_b)):
            if not top or top['points'] < MIN_POINTS_FOR_STANDOUT:
                continue
            options = [
                f"{top['name']} ({team_name}) had a big game: {top['points']} points ({top['goals']} goals).",
                f"{top['name']} ({team_name}) was the standout performer, racking up {top['points']} points "
                f"({top['goals']} goals).",
                f"{top['name']} put on a show for {team_name} - {top['points']} points, {top['goals']} of "
                f"them goals.",
                f"{team_name} can thank {top['name']} for the performance: {top['points']} points "
                f"({top['goals']} goals).",
            ]
            candidates.append({
                'key': 'standout', 'score': _percentile_score(top['points'], baseline, one_sided=True),
                'text': vary(seed('standout', team_name), options),
            })

    # --- power play vs league ---
    baseline = baselines['team_pp_perc']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            if facts['PPperc'] is None or facts['PPOpp'] < MIN_OPP_FOR_RATE:
                continue
            options = [
                f"{team_name} were clinical on the power play, converting {facts['PPG']}/{facts['PPOpp']}.",
                f"{team_name}'s power play was the story of the game, scoring on {facts['PPG']} of "
                f"{facts['PPOpp']} chances.",
                f"{team_name} made their power plays count, cashing in {facts['PPG']}/{facts['PPOpp']}.",
            ]
            candidates.append({
                'key': 'special_teams_pp', 'score': _percentile_score(facts['PPperc'], baseline, one_sided=True),
                'text': vary(seed('special_teams_pp', team_name), options),
            })

    # --- penalty kill vs league ---
    baseline = baselines['team_sh_perc']
    if baseline:
        for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
            if facts['SHperc'] is None or facts['SHOpp'] < MIN_OPP_FOR_RATE:
                continue
            kills = facts['SHOpp'] - facts['PPGA']
            options = [
                f"{team_name}'s penalty kill was excellent, stopping {kills}/{facts['SHOpp']} shorthanded "
                f"situations.",
                f"{team_name} came up big down a player, killing off {kills} of {facts['SHOpp']} penalties.",
                f"{team_name}'s penalty kill bailed them out, {kills}/{facts['SHOpp']} shorthanded situations "
                f"killed off.",
            ]
            candidates.append({
                'key': 'special_teams_sh', 'score': _percentile_score(facts['SHperc'], baseline, one_sided=True),
                'text': vary(seed('special_teams_sh', team_name), options),
            })

    # --- shots that missed the target despite good underlying chances ---
    for team_name, facts in ((state.team_a_name, facts_a), (state.team_b_name, facts_b)):
        if facts['xG'] < MIN_XG_FOR_WASTED:
            continue
        missed_ratio = 1 - (facts['xGOT'] / facts['xG']) if facts['xG'] else 0
        if missed_ratio < WASTED_RATIO_THRESHOLD:
            continue
        off_target = facts['shots'] - facts['shotsOnTarget']
        options = [
            f"{team_name} had the looks but not the accuracy - {off_target} of their {facts['shots']} shots "
            f"missed the net or were blocked.",
            f"{team_name} created {facts['xG']:.2f} xG worth of chances but only {facts['xGOT']:.2f} of it "
            f"actually tested the goalie.",
            f"Accuracy let {team_name} down - {off_target} shots never reached the net.",
            f"{team_name} will wonder what could have been - plenty of good chances missed the target.",
        ]
        candidates.append({
            'key': 'wasted_chances', 'score': min(100.0, (facts['xG'] - facts['xGOT']) * 15),
            'text': vary(seed('wasted_chances', team_name), options),
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
                f"{team_name} created far more than usual: {facts['xG']:.2f} xG against their own average "
                f"of {own_rates['xgf_per_game']:.2f} per game.",
                f"This was a season-best-caliber performance for {team_name}'s attack: {facts['xG']:.2f} xG, "
                f"well above their usual {own_rates['xgf_per_game']:.2f} per game.",
                f"{team_name} generated far more than they usually do - {facts['xG']:.2f} xG compared to "
                f"their typical {own_rates['xgf_per_game']:.2f} per game.",
            ]
        else:
            options = [
                f"{team_name} were held well below their usual output: {facts['xG']:.2f} xG against their "
                f"own average of {own_rates['xgf_per_game']:.2f} per game.",
                f"{team_name}'s attack never got going - {facts['xG']:.2f} xG, down from their usual "
                f"{own_rates['xgf_per_game']:.2f} per game.",
                f"It was a quiet one for {team_name}'s offense - just {facts['xG']:.2f} xG against their "
                f"normal {own_rates['xgf_per_game']:.2f} per game.",
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
            f"{leader} controlled play, out-chancing their opponent {lead_val:.2f} to {trail_val:.2f} in "
            f"expected goals.",
            f"The underlying numbers were one-sided: {leader} held a {lead_val:.2f} to {trail_val:.2f} edge "
            f"in expected goals.",
            f"{leader} dominated the underlying play, {lead_val:.2f} to {trail_val:.2f} in expected goals.",
        ]
        candidates.append({
            'key': 'xg_margin', 'score': min(100.0, abs(xg_margin) * 20),
            'text': vary(seed('xg_margin'), options),
        })

    # --- result didn't match the underlying xG battle ---
    score_diff = state.score_a - state.score_b
    if score_diff != 0 and xg_margin != 0 and (score_diff > 0) != (xg_margin > 0) and abs(xg_margin) >= MIN_UPSET_XG_GAP:
        winner = state.team_a_name if score_diff > 0 else state.team_b_name
        xg_leader, xg_win_val, xg_lose_val = (
            (state.team_a_name, facts_a['xG'], facts_b['xG']) if xg_margin > 0
            else (state.team_b_name, facts_b['xG'], facts_a['xG'])
        )
        options = [
            f"{winner} got the result, but {xg_leader} were the better team by the underlying numbers "
            f"({xg_win_val:.2f} to {xg_lose_val:.2f} xG).",
            f"The scoreboard doesn't tell the whole story - {xg_leader} out-chanced {winner} {xg_win_val:.2f} "
            f"to {xg_lose_val:.2f} in expected goals.",
            f"{winner} will take the win, but {xg_leader} controlled the underlying play for much of the game.",
            f"An upset by the numbers: {xg_leader} generated more expected goals, but {winner} came away "
            f"with the result.",
        ]
        candidates.append({
            'key': 'upset', 'score': min(100.0, abs(xg_margin) * 20),
            'text': vary(seed('upset'), options),
        })

    # --- biggest win-probability swing of the game ---
    swing = _biggest_wp_swing(match_id)
    if swing:
        candidates.append({'key': 'wp_swing', 'score': float(swing.score), 'text': swing.text})

    candidates.sort(key=lambda c: c['score'], reverse=True)
    lead = candidates[0] if candidates else None
    rest = [c for c in candidates[1:] if lead is None or c['key'] != lead['key']]
    # upset/wasted_chances are rare, specifically-notable angles (result vs.
    # underlying process, and good chances that missed the target) - worth
    # surfacing whenever they fire rather than letting them lose out to a
    # routine percentile-based angle (e.g. a 2-for-2 penalty kill) that only
    # scores marginally higher.
    priority_keys = {'upset', 'wasted_chances'}
    priority = [c for c in rest if c['key'] in priority_keys]
    other = [c for c in rest if c['key'] not in priority_keys]
    support = (priority + other)[:MAX_BULLETS - 1]

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
