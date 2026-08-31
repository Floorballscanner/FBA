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

import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from math import floor

from django.core.management.base import BaseCommand

from accounts.models import FliigaSeasonStats

API_KEY = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk'
API_BASE = 'https://salibandy.api.torneopal.com/taso/rest'

# season_id -> competition_id, same mapping used across the F-Liiga pages.
SEASON_COMPETITION_IDS = {
    '2024-2025': 'sb2024',
    '2025-2026': 'sb2025',
    '2026-2027': 'sb2026',
}
CATEGORY_IDS = {'men': '402', 'women': '384'}
STAGE_GROUP_IDS = {'regular': '1', 'playoffs': '2'}

MAX_WORKERS = 16

# Same xG/xGOT matrices as fliigastatspage.js. Women's matches currently use
# the same matrix as men's too (the JS has unused women's matrices behind a
# commented-out branch) — preserved as-is; not a bug introduced by this port.
MAX_Y = 1700
MAX_X = 2000

XGOT_MATRIX = [
    [0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01],
    [0.0, 0.0, 10, 10, 16.67, 66.67, 16.67, 16.67, 16.67, 10, 10, 0.0, 0.0],
    [2, 2, 13, 14, 29, 38, 64, 38, 29, 14, 13, 2, 2],
    [4, 5, 15, 19, 29, 48, 50, 48, 29, 19, 15, 5, 4],
    [5, 8, 18, 20, 23, 32, 38, 32, 23, 20, 18, 8, 5],
    [7, 12, 16, 22, 26, 32, 36, 32, 26, 22, 16, 12, 7],
    [8, 13, 16, 18, 25, 29, 33, 29, 25, 18, 16, 13, 8],
    [9, 15, 16, 23, 27, 31, 32, 31, 27, 23, 16, 15, 9],
    [12, 14, 16, 19, 23, 29, 30, 29, 23, 19, 16, 14, 12],
    [13, 14, 15, 18, 22, 26, 28, 26, 22, 18, 15, 14, 13],
    [13, 13, 13, 16, 21, 25, 25, 25, 21, 16, 13, 13, 13],
    [10, 11, 12, 15, 19, 20, 21, 20, 19, 15, 12, 11, 10],
    [7, 9, 11, 13, 15, 17, 19, 17, 15, 13, 11, 9, 7],
    [5, 7, 9, 11, 13, 15, 17, 15, 13, 11, 9, 7, 5],
]

XG_MATRIX = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0.0, 0.0, 17, 17, 17, 40.0, 40.0, 40.0, 40.0, 0.0, 25.0, 0.0, 0.0],
    [1, 1, 7, 14, 20, 30, 54, 30, 20, 14, 7, 1, 1],
    [2, 3, 8, 10, 16, 30, 30, 30, 16, 10, 8, 3, 2],
    [3, 4, 10, 11, 12, 17, 21, 17, 12, 11, 10, 4, 3],
    [4, 7, 9, 12, 14, 17, 19, 17, 14, 12, 9, 6, 4],
    [4, 7, 9, 10, 14, 16, 18, 16, 14, 10, 9, 7, 4],
    [5, 8, 9, 12, 15, 17, 17, 17, 15, 12, 9, 8, 5],
    [7, 8, 9, 10, 12, 16, 16, 16, 12, 10, 9, 8, 7],
    [7, 8, 8, 10, 12, 14, 15, 14, 12, 10, 8, 8, 7],
    [7, 7, 7, 9, 11, 14, 14, 14, 11, 9, 7, 7, 7],
    [5, 6, 7, 8, 10, 11, 11, 11, 10, 8, 7, 6, 5],
    [4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4],
    [3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3],
]


def calc_xg(x, y):
    x = 1000 + x
    if y >= MAX_Y:
        y = MAX_Y - 1
    yd = 2 + floor(y / MAX_Y * 12)
    xd = floor(x / MAX_X * 12)
    yd = max(0, min(yd, len(XG_MATRIX) - 1))
    xd = max(0, min(xd, len(XG_MATRIX[0]) - 1))
    return {'xGOT': XGOT_MATRIX[yd][xd] / 100, 'xG': XG_MATRIX[yd][xd] / 100}


def api_get(endpoint, **params):
    query = '&'.join(f'{k}={v}' for k, v in params.items())
    url = f'{API_BASE}/{endpoint}?api_key={API_KEY}&{query}'
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read())


def num(value, cast=float, default=0):
    try:
        return cast(value)
    except (TypeError, ValueError):
        return default


def round2(x):
    return round(x, 2)


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

        teams = api_get(
            'getTeams',
            competition_id=SEASON_COMPETITION_IDS[season_id],
            category_id=CATEGORY_IDS[category],
        ).get('teams') or []

        matches_played = [m for m in matches if m.get('status') == 'Played']
        is_final = len(matches_played) == len(matches)

        if not matches_played:
            self.stdout.write(f"  No played matches yet for {season_id}/{category}/{stage}, nothing to cache.")
            return

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
            teams, matches_played, match_details, team_details,
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

    def compute_stats(self, teams, matches_played, match_details, team_details):
        # --- Shots, xG/xGOT per shot ---
        shots = []
        for match in matches_played:
            match_id = match['match_id']
            events = match_details.get(match_id, {}).get('events') or []
            for event in events:
                if event.get('code') not in ('laukausohi', 'laukausblokattu', 'laukausmaali', 'laukaus'):
                    continue
                x, y = 0.0, 0.0
                location = event.get('location') or ''
                parts = location.split(',')
                if len(parts) == 2:
                    x, y = num(parts[0]), num(parts[1])
                res = calc_xg(x, y)
                shot = dict(event)
                shot['match_id'] = match_id
                shot['team_id'] = str(event.get('team_id') or '')
                shot['player_id'] = event.get('player_id')
                shot['xG'] = res['xG']
                shot['xGOT'] = res['xGOT'] if event.get('code') in ('laukaus', 'laukausmaali') else 0
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
            match['S_A'], match['S_B'] = len(shots_a), len(shots_b)
            match['SOG_A'], match['SOG_B'] = len(sog_a), len(sog_b)
            match['G_A'], match['G_B'] = len(goals_a), len(goals_b)

            lineups = match_details.get(match_id, {}).get('lineups') or []
            match['Goalie_A'] = next(
                (l['player_name'] for l in lineups if str(l.get('team_id')) == team_a_id and l.get('position') == 'MV/1'),
                None,
            )
            match['Goalie_B'] = next(
                (l['player_name'] for l in lineups if str(l.get('team_id')) == team_b_id and l.get('position') == 'MV/1'),
                None,
            )

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
                'team_id': team['team_id'], 'team_name': name,
                'Games': 0, 'GF': 0, 'GA': 0, 'GDiff': 0, 'SF': 0, 'SA': 0, 'SDiff': 0,
                'xGF': 0.0, 'xGA': 0.0, 'xGDiff': 0.0, 'xGperc': 0.0,
                'xGOTF': 0.0, 'xGOTA': 0.0, 'xGOTperc': 0.0, 'GFAxG': 0.0, 'GAAxG': 0.0,
            }
            for match in matches_played:
                if match['team_A_name'] == name:
                    ts['Games'] += 1
                    ts['GF'] += match['G_A']; ts['GA'] += match['G_B']
                    ts['SF'] += match['S_A']; ts['SA'] += match['S_B']
                    ts['xGF'] += match['xG_A']; ts['xGA'] += match['xG_B']
                    ts['xGOTF'] += match['xGOT_A']; ts['xGOTA'] += match['xGOT_B']
                if match['team_B_name'] == name:
                    ts['Games'] += 1
                    ts['GF'] += match['G_B']; ts['GA'] += match['G_A']
                    ts['SF'] += match['S_B']; ts['SA'] += match['S_A']
                    ts['xGF'] += match['xG_B']; ts['xGA'] += match['xG_A']
                    ts['xGOTF'] += match['xGOT_B']; ts['xGOTA'] += match['xGOT_A']

            ts['xGDiff'] = round2(ts['xGF'] - ts['xGA'])
            ts['xGperc'] = round2(ts['xGF'] / (ts['xGF'] + ts['xGA'])) if (ts['xGF'] + ts['xGA']) else 0
            ts['GFAxG'] = round2(ts['GF'] - ts['xGF'])
            ts['GAAxG'] = round2(ts['GA'] - ts['xGA'])
            ts['SDiff'] = ts['SF'] - ts['SA']
            ts['GDiff'] = ts['GF'] - ts['GA']
            ts['xGOTperc'] = round2(ts['xGOTF'] / (ts['xGOTF'] + ts['xGOTA'])) if (ts['xGOTF'] + ts['xGOTA']) else 0
            ts['xGF'] = round2(ts['xGF']); ts['xGA'] = round2(ts['xGA'])
            ts['xGOTF'] = round2(ts['xGOTF']); ts['xGOTA'] = round2(ts['xGOTA'])
            team_stats.append(ts)

        team_stats.sort(key=lambda t: t['xGDiff'], reverse=True)

        # --- Player stats ---
        players_all = []
        for team in teams:
            detail = team_details.get(team['team_id'], {})
            for p in detail.get('players') or []:
                players_all.append({
                    'ID': str(p.get('player_id')),
                    'Team': detail.get('team_name'),
                    'Name': f"{p.get('first_name', '')} {p.get('last_name', '')}".strip(),
                    'Nr': p.get('shirt_number'),
                    'Position': p.get('position'),
                    'Games': num(p.get('matches'), int),
                    'G': num(p.get('goals'), int),
                    'A': num(p.get('assists'), int),
                    'P': num(p.get('points'), int),
                    'S': num(p.get('shots_total'), int),
                    'SM': num(p.get('shots_off_target'), int),
                    'plus': num(p.get('plus'), int),
                    'minus': num(p.get('minus'), int),
                    'xG': 0.0, 'xGOT': 0.0, 'GAxG': 0.0,
                })

        player_stats = [p for p in players_all if p['Games'] > 0]
        for player in player_stats:
            for shot in shots:
                if str(shot.get('player_id')) == player['ID']:
                    player['xG'] += shot['xG']
                    player['xGOT'] += shot['xGOT']
            player['xG'] = round2(player['xG'])
            player['xGOT'] = round2(player['xGOT'])
            player['GAxG'] = round2(player['G'] - player['xG'])

        player_stats = [p for p in player_stats if p['xG'] > 0]
        player_stats.sort(key=lambda p: p['GAxG'], reverse=True)

        # --- Goalie stats ---
        goalies_all = []
        for team in teams:
            detail = team_details.get(team['team_id'], {})
            for p in detail.get('players') or []:
                if p.get('position') != 'MV':
                    continue
                goalies_all.append({
                    'Name': f"{p.get('last_name', '')} {p.get('first_name', '')}".strip(),
                    'Team': detail.get('team_name'),
                    'Games': 0, 'xGOTA': 0.0, 'GA': 0, 'SA': 0, 'Saves': 0,
                    'GSAx': 0.0, 'GSAxPerGame': 0.0,
                })

        for goalie in goalies_all:
            for match in matches_played:
                if match.get('Goalie_A') == goalie['Name']:
                    goalie['Games'] += 1
                    goalie['xGOTA'] += match['xGOT_B']
                    goalie['GA'] += match['G_B']
                    goalie['SA'] += match['SOG_B']
                    goalie['Saves'] += match['SOG_B'] - match['G_B']
                if match.get('Goalie_B') == goalie['Name']:
                    goalie['Games'] += 1
                    goalie['xGOTA'] += match['xGOT_A']
                    goalie['GA'] += match['G_A']
                    goalie['SA'] += match['SOG_A']
                    goalie['Saves'] += match['SOG_A'] - match['G_A']
            goalie['xGOTA'] = round2(goalie['xGOTA'])
            goalie['GSAx'] = round2(goalie['xGOTA'] - goalie['GA'])
            goalie['GSAxPerGame'] = round2(goalie['GSAx'] / goalie['Games']) if goalie['Games'] else 0.0

        goalie_stats = [g for g in goalies_all if g['Games'] > 0]
        goalie_stats.sort(key=lambda g: g['GSAxPerGame'], reverse=True)

        return team_stats, player_stats, goalie_stats
