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

from concurrent.futures import ThreadPoolExecutor, as_completed

from django.core.management.base import BaseCommand

from accounts.models import FliigaSeasonStats
from insights.xg_model import calc_xg
from insights.special_teams import (
    parse_penalty_segments, situation_from_goal_tag, compute_shot_situations, find_goal_tag,
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
            period_lengths = match_details.get(match_id, {}).get('period_lengths_sec') or [0, 1200, 1200, 1200, 300]
            shot_situations = compute_shot_situations(events, period_lengths)
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
                if event.get('code') == 'laukausmaali':
                    shot['situation'] = situation_from_goal_tag(find_goal_tag(events, shot))
                else:
                    shot['situation'] = shot_situations.get(event.get('event_id'), 'EVEN')
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
                'xGFPP': 0.0, 'xGAPP': 0.0,
                'PPG': 0, 'PPOpp': 0, 'SHOpp': 0, 'PPGA': 0, 'PPperc': 0.0, 'SHperc': 0.0,
            }
            for match in matches_played:
                if match['team_A_name'] == name:
                    ts['Games'] += 1
                    ts['GF'] += match['G_A']; ts['GA'] += match['G_B']
                    ts['SF'] += match['S_A']; ts['SA'] += match['S_B']
                    ts['xGF'] += match['xG_A']; ts['xGA'] += match['xG_B']
                    ts['xGOTF'] += match['xGOT_A']; ts['xGOTA'] += match['xGOT_B']
                    ts['xGFPP'] += match['xGPP_A']; ts['xGAPP'] += match['xGPP_B']
                    ts['PPG'] += match['PPG_A']; ts['PPOpp'] += match['PPOpp_A']
                    ts['SHOpp'] += match['PPOpp_B']; ts['PPGA'] += match['PPG_B']
                if match['team_B_name'] == name:
                    ts['Games'] += 1
                    ts['GF'] += match['G_B']; ts['GA'] += match['G_A']
                    ts['SF'] += match['S_B']; ts['SA'] += match['S_A']
                    ts['xGF'] += match['xG_B']; ts['xGA'] += match['xG_A']
                    ts['xGOTF'] += match['xGOT_B']; ts['xGOTA'] += match['xGOT_A']
                    ts['xGFPP'] += match['xGPP_B']; ts['xGAPP'] += match['xGPP_A']
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
            ts['PPperc'] = round2(ts['PPG'] / ts['PPOpp']) if ts['PPOpp'] else 0.0
            ts['SHperc'] = round2(1 - ts['PPGA'] / ts['SHOpp']) if ts['SHOpp'] else 0.0
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
                    # S/SM used to trust Torneopal's own shots_total/shots_off_target
                    # fields via getTeam, but those come back blank for most players -
                    # computed from our own shot-level data instead, same as xG/xGOT.
                    'S': 0, 'SM': 0,
                    'plus': num(p.get('plus'), int),
                    'minus': num(p.get('minus'), int),
                    'xG': 0.0, 'xGOT': 0.0, 'xGPP': 0.0, 'PPG': 0, 'PPS': 0, 'GAxG': 0.0,
                })

        player_stats = [p for p in players_all if p['Games'] > 0]
        for player in player_stats:
            for shot in shots:
                if str(shot.get('player_id')) == player['ID']:
                    player['S'] += 1
                    if shot['code'] == 'laukausohi':
                        player['SM'] += 1
                    player['xG'] += shot['xG']
                    player['xGOT'] += shot['xGOT']
                    if shot.get('situation') == 'PP':
                        player['xGPP'] += shot['xG']
                        player['PPS'] += 1
                        if shot['code'] == 'laukausmaali':
                            player['PPG'] += 1
            player['xG'] = round2(player['xG'])
            player['xGOT'] = round2(player['xGOT'])
            player['xGPP'] = round2(player['xGPP'])
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
