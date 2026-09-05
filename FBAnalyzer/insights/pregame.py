"""Pregame analysis: a single set of facts + text computed once per match,
before kickoff.

Traditional stats (record, streak, top scorer, hot/cold goalie) get equal
footing with xG-driven ones - every angle is scored against the same
HistoricalBaseline population percentiles the live insight engine uses
(insights.live_insights), via the shared insights.percentiles.percentile_rank,
so "extreme" means the same thing in both places. The text leads with
whichever angle scores most extreme tonight, with up to two more as support,
plus a head-to-head note if the teams have met recently. If nothing clears
the notability bar, it falls back to a plain "even matchup" framing.

Team history (_team_history/_head_to_head) is NOT season-scoped: regular-
season history is compared against regular-season history and playoffs
against playoffs (matching on category+stage), but pools every season
currently ingested - same as HistoricalBaseline, which has no season_id
either. This is what keeps week-1-of-a-new-season pregame text meaningful
instead of empty.

Computed either by the compute_pregame management command (ahead of
kickoff) or lazily on first request via the pregame API endpoint - whichever
gets there first; update_or_create makes re-running harmless. Once a match
goes live, PregameAnalysis.is_final locks and compute_pregame_analysis()
refuses to touch it again (same idea as compute_fliiga_stats.py's
is_final-skip, but the reason for locking is "the game already started",
not "there's nothing new to compute").
"""

from collections import defaultdict

from django.db.models import Q

from .event_codes import ASSIST_CODE, GOAL_AGAINST_CODE, GOAL_CODE, GOALIE_CODES, SHOT_CODES
from .models import HistoricalBaseline, MatchEvent, MatchState, PregameAnalysis
from .percentiles import percentile_rank
from .special_teams import PENALTY_CODE_RE

RECENT_FORM_GAMES = 6  # "hot/cold" window for a team's current goalie
STREAK_NOTABLE_GAMES = 3
MIN_GOALS_FOR_TOP_SCORER = 5  # don't lead with a "top scorer" who has next to nothing


def is_penalty(code):
    return bool(PENALTY_CODE_RE.match(code or ''))


def _team_history(team_id, category, stage, before_date=None):
    """Team's own past 'played' matches, chronological - not season-scoped:
    regular-season history compares against regular-season history and
    playoffs against playoffs (same stage), but pools every season currently
    ingested, same as HistoricalBaseline itself (which has no season_id).
    Early in a new season this is what lets a team's carried-over record/
    streak/rates still mean something instead of showing nothing.

    The status='played' filter alone already excludes the match this is
    being computed for (it's still 'scheduled'). before_date is a second,
    stricter guard for the rare case where Torneopal has published some
    other match's result but not yet this one's - without it, a same-day or
    date-less fixture could pull in a chronologically later result. When
    Torneopal hasn't published a date for the scheduled match itself yet,
    there's nothing to filter against, so this deliberately falls back to
    "all played history" rather than returning nothing.
    """
    qs = MatchState.objects.filter(
        Q(team_a_id=team_id) | Q(team_b_id=team_id),
        category=category, stage=stage, status='played',
    )
    if before_date:
        qs = qs.filter(date__lt=before_date)
    return list(qs.order_by('date'))


def _record_and_streak(team_id, matches):
    """(wins, losses, streak) - streak > 0 is a win streak, < 0 a loss
    streak, magnitude is the current run length."""
    wins = losses = streak = 0
    for m in matches:
        is_a = m.team_a_id == team_id
        won = (m.score_a > m.score_b) if is_a else (m.score_b > m.score_a)
        if won:
            wins += 1
            streak = streak + 1 if streak >= 0 else 1
        else:
            losses += 1
            streak = streak - 1 if streak <= 0 else -1
    return wins, losses, streak


def _rate_stats(team_id, matches):
    """Season-to-date xGF/xGA/finishing-luck/PP%/SH%, aggregated the same
    way as compute_baselines.py so results are directly comparable to its
    HistoricalBaseline percentiles."""
    if not matches:
        return None

    match_ids = [m.match_id for m in matches]
    events_by_match = defaultdict(list)
    for e in MatchEvent.objects.filter(match_id__in=match_ids):
        events_by_match[e.match_id].append(e)

    games = len(matches)
    xgf = xga = 0.0
    gf = pp_goals = pp_opp = sh_opp = pp_goals_against = 0

    for m in matches:
        side = 'A' if m.team_a_id == team_id else 'B'
        opp_side = 'B' if side == 'A' else 'A'
        evs = events_by_match.get(m.match_id, [])
        shots = [e for e in evs if e.code in SHOT_CODES]
        own_shots = [s for s in shots if s.team == side]
        opp_shots = [s for s in shots if s.team == opp_side]

        xgf += sum(float(s.xg or 0) for s in own_shots)
        xga += sum(float(s.xg or 0) for s in opp_shots)
        gf += sum(1 for s in own_shots if s.code == GOAL_CODE)
        pp_goals += sum(1 for s in own_shots if s.code == GOAL_CODE and s.situation == 'PP')
        pp_goals_against += sum(1 for s in opp_shots if s.code == GOAL_CODE and s.situation == 'PP')
        pp_opp += sum(1 for e in evs if e.team == opp_side and is_penalty(e.code))
        sh_opp += sum(1 for e in evs if e.team == side and is_penalty(e.code))

    return {
        'games': games,
        'xgf_per_game': round(xgf / games, 3), 'xga_per_game': round(xga / games, 3),
        'gf_axg_per_game': round((gf - xgf) / games, 3),
        'pp_perc': round(pp_goals / pp_opp, 3) if pp_opp else None,
        'sh_perc': round(1 - pp_goals_against / sh_opp, 3) if sh_opp else None,
    }


def _top_scorer(team_id, matches):
    match_ids = [m.match_id for m in matches]
    players = defaultdict(lambda: {'points': 0, 'goals': 0, 'name': ''})
    for e in MatchEvent.objects.filter(match_id__in=match_ids, team_id=team_id, code__in=(GOAL_CODE, ASSIST_CODE)):
        p = players[e.player_id]
        p['points'] += 1
        if e.code == GOAL_CODE:
            p['goals'] += 1
        p['name'] = p['name'] or (e.raw or {}).get('player_name', '')
    if not players:
        return None
    return max(players.values(), key=lambda p: p['points'])


def _recent_goalie(team_id, matches):
    """The goalie with the most appearances among the team's last
    RECENT_FORM_GAMES matches, and their GSAx/game over that window."""
    recent_ids = [m.match_id for m in matches[-RECENT_FORM_GAMES:]]
    if not recent_ids:
        return None

    goalies = defaultdict(lambda: {'games': set(), 'xgot': 0.0, 'ga': 0, 'name': ''})
    for e in MatchEvent.objects.filter(match_id__in=recent_ids, team_id=team_id, code__in=GOALIE_CODES):
        g = goalies[e.player_id]
        g['games'].add(e.match_id)
        g['xgot'] += float(e.xgot or 0)
        g['name'] = g['name'] or (e.raw or {}).get('player_name', '')
        if e.code == GOAL_AGAINST_CODE:
            g['ga'] += 1
    if not goalies:
        return None
    starter = max(goalies.values(), key=lambda g: len(g['games']))
    games = len(starter['games'])
    return {
        'name': starter['name'], 'games': games,
        'gsax_per_game': round((starter['xgot'] - starter['ga']) / games, 3),
    }


def _head_to_head(team_a_id, team_b_id, category, stage):
    """Not season-scoped, same reasoning as _team_history - see there."""
    matches = MatchState.objects.filter(
        Q(team_a_id=team_a_id, team_b_id=team_b_id) | Q(team_a_id=team_b_id, team_b_id=team_a_id),
        category=category, stage=stage, status='played',
    )
    games = matches.count()
    if not games:
        return None
    wins_a = sum(1 for m in matches if (
        (m.team_a_id == team_a_id and m.score_a > m.score_b) or
        (m.team_b_id == team_a_id and m.score_b > m.score_a)
    ))
    return {'games': games, 'wins_a': wins_a, 'wins_b': games - wins_a}


def compute_pregame_analysis(match_id, force=False):
    existing = PregameAnalysis.objects.filter(match_id=match_id).first()
    if existing and existing.is_final and not force:
        return existing

    state = MatchState.objects.filter(match_id=match_id).first()
    if state is None or not state.team_a_id or not state.team_b_id:
        return None

    history_a = _team_history(state.team_a_id, state.category, state.stage, before_date=state.date)
    history_b = _team_history(state.team_b_id, state.category, state.stage, before_date=state.date)

    rates_a = _rate_stats(state.team_a_id, history_a)
    rates_b = _rate_stats(state.team_b_id, history_b)
    wins_a, losses_a, streak_a = _record_and_streak(state.team_a_id, history_a)
    wins_b, losses_b, streak_b = _record_and_streak(state.team_b_id, history_b)
    top_a = _top_scorer(state.team_a_id, history_a)
    top_b = _top_scorer(state.team_b_id, history_b)
    goalie_a = _recent_goalie(state.team_a_id, history_a)
    goalie_b = _recent_goalie(state.team_b_id, history_b)
    h2h = _head_to_head(state.team_a_id, state.team_b_id, state.category, state.stage)

    baselines = {
        bt: HistoricalBaseline.objects.filter(baseline_type=bt, category=state.category, stage=state.stage).first()
        for bt in ('team_xgf_per_game', 'team_gf_axg_per_game', 'team_pp_perc', 'goalie_gsax_per_game')
    }

    candidates = []  # each: {'key': str, 'score': float, 'text': str}

    for team_name, streak in ((state.team_a_name, streak_a), (state.team_b_name, streak_b)):
        if abs(streak) >= STREAK_NOTABLE_GAMES:
            kind = 'winning' if streak > 0 else 'losing'
            candidates.append({
                'key': 'streak', 'score': min(100.0, abs(streak) * 20),
                'text': f"{team_name} arrive on a {abs(streak)}-game {kind} streak.",
            })

    baseline = baselines['goalie_gsax_per_game']
    if baseline:
        for team_name, goalie in ((state.team_a_name, goalie_a), (state.team_b_name, goalie_b)):
            if not goalie or goalie['games'] < 2:
                continue
            rank = percentile_rank(goalie['gsax_per_game'], baseline.percentiles)
            quality = 'red-hot' if goalie['gsax_per_game'] > 0 else 'ice-cold'
            candidates.append({
                'key': 'goalie', 'score': abs(rank - 50) * 2,
                'text': (
                    f"{goalie['name']} ({team_name}) has been {quality} in net over the last {goalie['games']} "
                    f"starts ({goalie['gsax_per_game']:+.2f} goals saved above expected per game)."
                ),
            })

    for team_name, top in ((state.team_a_name, top_a), (state.team_b_name, top_b)):
        if top and top['goals'] >= MIN_GOALS_FOR_TOP_SCORER:
            candidates.append({
                'key': 'scorer', 'score': min(100.0, top['goals'] * 6),
                'text': f"{top['name']} ({team_name}) leads the way with {top['goals']} goals over that stretch.",
            })

    baseline = baselines['team_gf_axg_per_game']
    if baseline:
        for team_name, rates in ((state.team_a_name, rates_a), (state.team_b_name, rates_b)):
            if not rates:
                continue
            rank = percentile_rank(rates['gf_axg_per_game'], baseline.percentiles)
            direction = 'above' if rates['gf_axg_per_game'] > 0 else 'below'
            candidates.append({
                'key': 'luck', 'score': abs(rank - 50) * 2,
                'text': (
                    f"{team_name} have scored {abs(rates['gf_axg_per_game']):.1f} goals per game {direction} "
                    f"their expected goals over their last {rates['games']} games - a pace that tends to even out."
                ),
            })

    baseline = baselines['team_xgf_per_game']
    if baseline and rates_a and rates_b:
        rank_a = percentile_rank(rates_a['xgf_per_game'], baseline.percentiles)
        rank_b = percentile_rank(rates_b['xgf_per_game'], baseline.percentiles)
        gap = rates_a['xgf_per_game'] - rates_b['xgf_per_game']
        leader, lead_val, trail_val = (
            (state.team_a_name, rates_a['xgf_per_game'], rates_b['xgf_per_game']) if gap > 0
            else (state.team_b_name, rates_b['xgf_per_game'], rates_a['xgf_per_game'])
        )
        candidates.append({
            'key': 'xg_gap', 'score': abs(rank_a - rank_b),
            'text': (
                f"{leader} hold the clear underlying edge: {lead_val:.2f} to {trail_val:.2f} expected goals "
                f"per game over their recent form."
            ),
        })

    if baselines['team_pp_perc'] and rates_a and rates_b and rates_a['pp_perc'] is not None and rates_b['pp_perc'] is not None:
        gap = abs(rates_a['pp_perc'] - rates_b['pp_perc'])
        better = state.team_a_name if rates_a['pp_perc'] > rates_b['pp_perc'] else state.team_b_name
        candidates.append({
            'key': 'special_teams', 'score': min(100.0, gap * 150),
            'text': (
                f"Special teams could decide this one: {better} convert power plays at a notably higher "
                f"rate than their opponent recently."
            ),
        })

    candidates.sort(key=lambda c: c['score'], reverse=True)
    lead = candidates[0] if candidates else None
    support = [c for c in candidates[1:] if lead is None or c['key'] != lead['key']][:2]

    if lead:
        text_parts = [lead['text']] + [c['text'] for c in support]
    else:
        text_parts = [f"A close matchup on paper between {state.team_a_name} and {state.team_b_name}."]
        if rates_a and rates_b:
            text_parts.append(
                f"{state.team_a_name} average {rates_a['xgf_per_game']:.2f} expected goals per game to "
                f"{state.team_b_name}'s {rates_b['xgf_per_game']:.2f} recently."
            )

    if h2h:
        text_parts.append(
            f"{state.team_a_name} and {state.team_b_name} have met {h2h['games']} time(s) recently "
            f"({h2h['wins_a']}-{h2h['wins_b']})."
        )

    facts = {
        'team_a': {
            'name': state.team_a_name, 'record': f"{wins_a}-{losses_a}", 'streak': streak_a,
            'rates': rates_a, 'top_scorer': top_a, 'goalie': goalie_a,
        },
        'team_b': {
            'name': state.team_b_name, 'record': f"{wins_b}-{losses_b}", 'streak': streak_b,
            'rates': rates_b, 'top_scorer': top_b, 'goalie': goalie_b,
        },
        'head_to_head': h2h,
        'lead_angle': lead['key'] if lead else 'even_matchup',
        'bullets': text_parts,  # same sentences as `text`, kept separate for bullet-point rendering
    }

    analysis, _ = PregameAnalysis.objects.update_or_create(
        match_id=match_id,
        defaults={
            'category': state.category, 'facts': facts, 'text': ' '.join(text_parts),
            'is_final': state.status != 'scheduled',
        },
    )
    return analysis
