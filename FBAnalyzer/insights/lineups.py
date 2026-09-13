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
    single most probable player at each (role, line_number) slot - e.g.
    {('KH', 1): {'player_id': ..., 'player_name': ..., 'games': 14, 'of': 18,
    'probability': 0.778}}. 'probability' (games at this slot / of) is the
    guessed lineup's actual confidence hint, since a team's real matchday
    lineup varies game to game (injuries, rotation, roster moves).

    A player can only end up in one slot: (slot, player, count) triples are
    resolved greedily, highest count first, each already-used slot or player
    skipped from then on - otherwise a versatile player who splits time
    between two slots (e.g. Line 1 and Line 2 center) could independently top
    both slots' counts and appear "in the lineup twice", or - for goalies,
    where a team only really has two candidates - both MV/1 and MV/2 could
    resolve to the same starter. Confirmed live 2026-09-13: exactly these two
    cases (a skater in two positions, a goalie in both goalie slots) for real
    F-Liiga teams before this fix."""

    slot_counts = defaultdict(Counter)
    player_names = {}

    for row in lineup_rows:
        if not row.role or row.line_number is None:
            continue
        slot = (row.role, row.line_number)
        slot_counts[slot][row.player_id] += 1
        player_names[row.player_id] = row.player_name

    total_games = len({row.match_id for row in lineup_rows})

    candidates = [
        (count, slot, player_id)
        for slot, counts in slot_counts.items()
        for player_id, count in counts.items()
    ]
    candidates.sort(key=lambda c: c[0], reverse=True)

    lineup = {}
    filled_slots = set()
    assigned_players = set()
    for count, slot, player_id in candidates:
        if slot in filled_slots or player_id in assigned_players:
            continue
        lineup[slot] = {
            'player_id': player_id, 'player_name': player_names.get(player_id, ''),
            'games': count, 'of': total_games,
            'probability': round(count / total_games, 3) if total_games else 0,
        }
        filled_slots.add(slot)
        assigned_players.add(player_id)
    return lineup
