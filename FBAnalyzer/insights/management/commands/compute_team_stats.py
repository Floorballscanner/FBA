"""Computes TeamSeasonStats for every team that has played at least one match
in a given season/category/stage - the "General season performance" theme of
the F-Liiga Team Analysis page (see the approved plan in
insights.models.TeamSeasonStats's docstring).

Unlike PregameAnalysis, nothing here is season-pooled: a team's season stats
are exactly that team's stats for that one season_id, since a coach comparing
"this team's season so far" should never see a prior season's games silently
blended in. Best-players and last-5-games are therefore also season-scoped,
same as pregame.py's player-level facts (rosters turn over between seasons).

Every rate KPI also gets a league rank (facts['ranks'][metric] = {'rank': n,
'of': total}) - competition ranking (ties share a rank, the next distinct
value skips accordingly), computed once per season/category/stage across
every team in that combo, so a coach sees "3rd of 12" next to a raw number.
This requires computing every team's facts before any of them are saved, so
--team-id still ranks against the full league rather than just itself.

Run this on the same cadence as compute_pregame/compute_fliiga_stats (Heroku
Scheduler, a few times a day is enough - it recomputes from scratch each run,
same as compute_fliiga_stats.py). Safe to re-run any time: update_or_create
keyed on (season_id, category, stage, team_id).
"""

from collections import defaultdict

from django.core.management.base import BaseCommand
from django.db.models import Q

from insights.event_codes import ASSIST_CODE, GOAL_CODE, SHOT_CODES
from insights.models import MatchState, MatchEvent, TeamSeasonStats
from insights.pregame import is_penalty
from insights.torneopal import CATEGORY_IDS, STAGE_GROUP_IDS

LAST_N_GAMES = 5
BEST_PLAYERS_PER_METRIC = 5
PLAYER_METRICS = ('points', 'goals', 'assists', 'xg', 'xgot', 'gaxg')

# (facts key, sort direction) for every KPI ranked against the rest of the
# league in this season/category/stage. 'asc' means lower is better (e.g.
# goals against), 'desc' means higher is better.
RANK_METRICS = [
    ('win_perc', 'desc'),
    ('gf_per_game', 'desc'), ('ga_per_game', 'asc'),
    ('xgf_per_game', 'desc'), ('xga_per_game', 'asc'),
    ('xgotf_per_game', 'desc'), ('xgota_per_game', 'asc'),
    ('pp_perc', 'desc'), ('sh_perc', 'desc'),
]


def _teams_in(season_id, category, stage):
    """Distinct {team_id: team_name} for every team that has a 'played' match
    in this season/category/stage, pulled from both the team_a and team_b
    sides of MatchState."""
    teams = {}
    qs = MatchState.objects.filter(
        season_id=season_id, category=category, stage=stage, status='played',
    ).values('team_a_id', 'team_a_name', 'team_b_id', 'team_b_name')
    for row in qs:
        if row['team_a_id']:
            teams[row['team_a_id']] = row['team_a_name']
        if row['team_b_id']:
            teams[row['team_b_id']] = row['team_b_name']
    return teams


def _compute_facts(team_id, season_id, category, stage):
    """All of a team's season facts except league ranks - those need every
    other team's facts first, so the caller adds them afterwards via
    _add_ranks(). Returns None if the team has no played matches."""
    matches = list(MatchState.objects.filter(
        Q(team_a_id=team_id) | Q(team_b_id=team_id),
        season_id=season_id, category=category, stage=stage, status='played',
    ).order_by('date'))
    if not matches:
        return None

    match_ids = [m.match_id for m in matches]
    events_by_match = defaultdict(list)
    for e in MatchEvent.objects.filter(match_id__in=match_ids):
        events_by_match[e.match_id].append(e)

    games = len(matches)
    wins = losses = 0
    xgf = xga = xgotf = xgota = 0.0
    gf = ga = 0
    pp_goals = pp_opp = sh_opp = pp_goals_against = 0
    players = defaultdict(lambda: {'name': '', 'points': 0, 'goals': 0, 'assists': 0, 'xg': 0.0, 'xgot': 0.0})
    # xg/xgot accumulate from every shot the player took (own_shots below), not just
    # goals - matches accounts.compute_fliiga_stats' player table convention.
    last_games = []

    for m in matches:
        side = 'A' if m.team_a_id == team_id else 'B'
        opp_side = 'B' if side == 'A' else 'A'
        opp_name = m.team_b_name if side == 'A' else m.team_a_name
        score_for = m.score_a if side == 'A' else m.score_b
        score_against = m.score_b if side == 'A' else m.score_a
        won = score_for > score_against
        wins += 1 if won else 0
        losses += 0 if won else 1

        evs = events_by_match.get(m.match_id, [])
        shots = [e for e in evs if e.code in SHOT_CODES]
        own_shots = [s for s in shots if s.team == side]
        opp_shots = [s for s in shots if s.team == opp_side]

        game_xgf = sum(float(s.xg or 0) for s in own_shots)
        game_xga = sum(float(s.xg or 0) for s in opp_shots)
        xgf += game_xgf
        xga += game_xga
        xgotf += sum(float(s.xgot or 0) for s in own_shots)
        xgota += sum(float(s.xgot or 0) for s in opp_shots)
        gf += score_for
        ga += score_against
        pp_goals += sum(1 for s in own_shots if s.code == GOAL_CODE and s.situation == 'PP')
        pp_goals_against += sum(1 for s in opp_shots if s.code == GOAL_CODE and s.situation == 'PP')
        pp_opp += sum(1 for e in evs if e.team == opp_side and is_penalty(e.code))
        sh_opp += sum(1 for e in evs if e.team == side and is_penalty(e.code))

        for e in own_shots:
            if not e.player_id:
                continue
            p = players[e.player_id]
            p['xg'] += float(e.xg or 0)
            p['xgot'] += float(e.xgot or 0)
            p['name'] = p['name'] or (e.raw or {}).get('player_name', '')
            if e.code == GOAL_CODE:
                p['goals'] += 1
                p['points'] += 1
        for e in evs:
            if e.code == ASSIST_CODE and e.team == side and e.player_id:
                p = players[e.player_id]
                p['assists'] += 1
                p['points'] += 1
                p['name'] = p['name'] or (e.raw or {}).get('player_name', '')

        last_games.append({
            'match_id': m.match_id, 'date': m.date.isoformat() if m.date else None,
            'opponent': opp_name, 'score_for': score_for, 'score_against': score_against,
            'xg_for': round(game_xgf, 2), 'xg_against': round(game_xga, 2),
            'result': 'W' if won else 'L',
        })

    for p in players.values():
        p['xg'] = round(p['xg'], 2)
        p['xgot'] = round(p['xgot'], 2)
        p['gaxg'] = round(p['goals'] - p['xg'], 2)

    all_players = list(players.values())
    best_players = {
        metric: sorted(all_players, key=lambda p: p[metric], reverse=True)[:BEST_PLAYERS_PER_METRIC]
        for metric in PLAYER_METRICS
    }

    return {
        'games': games, 'wins': wins, 'losses': losses,
        'win_perc': round(wins / games, 3),
        'xgf_per_game': round(xgf / games, 3), 'xga_per_game': round(xga / games, 3),
        'xgotf_per_game': round(xgotf / games, 3), 'xgota_per_game': round(xgota / games, 3),
        'gf_per_game': round(gf / games, 3), 'ga_per_game': round(ga / games, 3),
        'pp_perc': round(pp_goals / pp_opp, 3) if pp_opp else None,
        'sh_perc': round(1 - pp_goals_against / sh_opp, 3) if sh_opp else None,
        'best_players': best_players,
        'last_games': last_games[-LAST_N_GAMES:][::-1],  # most recent first
    }


def _add_ranks(facts_by_team):
    """Mutates every team's facts in place, adding facts['ranks'][metric] =
    {'rank': n, 'of': total} for each RANK_METRICS entry that team has a
    value for. Competition ranking: equal values share a rank, and the next
    distinct value skips ahead accordingly (e.g. 1, 2, 2, 4)."""
    for metric, direction in RANK_METRICS:
        entries = [
            (team_id, facts[metric]) for team_id, facts in facts_by_team.items()
            if facts.get(metric) is not None
        ]
        entries.sort(key=lambda pair: pair[1], reverse=(direction == 'desc'))
        total = len(entries)

        prev_value, prev_rank = None, 0
        for i, (team_id, value) in enumerate(entries, start=1):
            rank = prev_rank if value == prev_value else i
            facts_by_team[team_id].setdefault('ranks', {})[metric] = {'rank': rank, 'of': total}
            prev_value, prev_rank = value, rank


class Command(BaseCommand):
    help = "Computes TeamSeasonStats for every team with played matches. See module docstring."

    def add_arguments(self, parser):
        parser.add_argument('--season-id')
        parser.add_argument('--category', choices=CATEGORY_IDS.keys())
        parser.add_argument('--stage', choices=STAGE_GROUP_IDS.keys())
        parser.add_argument('--team-id', help="Only save this one team_id (still ranked against the full league).")

    def handle(self, *args, **options):
        combos_qs = MatchState.objects.filter(status='played')
        if options['season_id']:
            combos_qs = combos_qs.filter(season_id=options['season_id'])
        if options['category']:
            combos_qs = combos_qs.filter(category=options['category'])
        if options['stage']:
            combos_qs = combos_qs.filter(stage=options['stage'])
        combos = combos_qs.exclude(season_id='').values_list('season_id', 'category', 'stage').distinct()

        total = 0
        for season_id, category, stage in combos:
            teams = _teams_in(season_id, category, stage)

            facts_by_team = {}
            for team_id in teams:
                facts = _compute_facts(team_id, season_id, category, stage)
                if facts:
                    facts_by_team[team_id] = facts
            if not facts_by_team:
                continue
            _add_ranks(facts_by_team)

            save_ids = {options['team_id']} if options['team_id'] else facts_by_team.keys()
            for team_id in save_ids & facts_by_team.keys():
                team_name = teams[team_id]
                TeamSeasonStats.objects.update_or_create(
                    season_id=season_id, category=category, stage=stage, team_id=team_id,
                    defaults={'team_name': team_name, 'facts': facts_by_team[team_id]},
                )
                total += 1
                self.stdout.write(f"  {season_id} {category} {stage}: {team_name} -> computed")
        self.stdout.write(f"Computed TeamSeasonStats for {total} team/season combos.")
