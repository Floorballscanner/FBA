"""Parsing and shared vocabulary for Torneopal's lineup `position` field
(e.g. "VL/1", "MV/2") - role abbreviation + "/" + line number. Confirmed
directly against a real getMatch response (see the F-Liiga Team Analysis
plan's Phase 2): a skater's role is one of the five below, a goalie is
always 'MV'. Used by insights.ingest when persisting MatchLineup rows, and
by compute_team_stats when aggregating "most probable lineup"/per-line KPIs.
"""

import re
from collections import Counter, defaultdict

ROLE_LABELS = {
    'OL': 'Right Wing', 'VL': 'Left Wing', 'KH': 'Center',
    'VP': 'Left Defense', 'OP': 'Right Defense', 'MV': 'Goalie',
}
SKATER_ROLES = ('VL', 'KH', 'OL', 'VP', 'OP')  # left-to-right display order for one line
GOALIE_ROLE = 'MV'

POSITION_RE = re.compile(r'^([A-Z]{2})/(\d+)$')


def parse_position(position):
    """"VL/1" -> ('VL', 1). Returns ('', None) for anything that doesn't
    match Torneopal's own "<role>/<line>" shape (unassigned bench players,
    missing data, etc.) rather than raising - a lineup row with no role/line
    just doesn't contribute to line-based aggregation."""
    match = POSITION_RE.match(position or '')
    if not match:
        return '', None
    return match.group(1), int(match.group(2))


def most_probable_lineup(lineup_rows):
    """Given every MatchLineup row for a team across a season, returns the
    single most common player at each (role, line_number) slot - e.g.
    {('KH', 1): {'player_id': ..., 'player_name': ..., 'games': 14, 'of': 18}}.
    'games'/'of' let the caller show "14 of 18 games" as a confidence hint
    alongside the guessed lineup, since a team's actual matchday lineup
    varies game to game (injuries, rotation, roster moves)."""

    slot_counts = defaultdict(Counter)
    slot_games = defaultdict(set)
    player_names = {}

    for row in lineup_rows:
        if not row.role or row.line_number is None:
            continue
        slot = (row.role, row.line_number)
        slot_counts[slot][row.player_id] += 1
        slot_games[slot].add(row.match_id)
        player_names[row.player_id] = row.player_name

    total_games = len({row.match_id for row in lineup_rows})

    lineup = {}
    for slot, counts in slot_counts.items():
        player_id, games_at_slot = counts.most_common(1)[0]
        lineup[slot] = {
            'player_id': player_id, 'player_name': player_names.get(player_id, ''),
            'games': games_at_slot, 'of': total_games,
        }
    return lineup
