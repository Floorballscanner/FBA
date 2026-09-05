"""Special teams (Powerplay/Shorthanded) derivation from raw Torneopal events.

Mirrored from static/js/fliigalivegame.js (the live game page) - kept as a
deliberate copy since there's no shared runtime between the client JS and
this server-side code. Ruleset confirmed against real Torneopal match data
(2025-2026 season):
- Penalty codes are "<N>min" or "<N>_<M>min" (e.g. "2min", "2_2min",
  "2_10min"). Only components of minor/major length (<=5 min) create a
  skater-count disadvantage; a paired 10/20-min component is a misconduct
  served without one.
- A power-play goal ends the conceding team's soonest-to-expire active
  penalty, same as ice hockey. If that was the first half of a
  double-minor, the second half starts immediately from the goal.
- Goals must NOT use this derivation - read Torneopal's own description tag
  instead (situation_from_goal_tag), since a delayed-penalty ('SR') goal has
  no backing penalty event to derive a window from.

accounts/management/commands/compute_fliiga_stats.py imports these instead
of keeping its own copy.
"""

import re

PENALTY_CODE_RE = re.compile(r'^(\d+)(?:_(\d+))?min$')


def parse_penalty_segments(code):
    m = PENALTY_CODE_RE.match(code or '')
    if not m:
        return None
    segments = [int(m.group(1)) * 60]
    if m.group(2) and int(m.group(2)) <= 5:
        segments.append(int(m.group(2)) * 60)
    return segments


def abs_game_time(period, time_sec, period_lengths):
    period = int(period)
    elapsed = sum((period_lengths[i] if i < len(period_lengths) else 1200) for i in range(1, period))
    return elapsed + int(time_sec)


def situation_from_goal_tag(description):
    tag = (description or '').strip().split()[0] if (description or '').strip() else ''
    if tag in ('YV', 'YV2', 'SR'):
        return 'PP'
    if tag == 'AV':
        return 'SH'
    return 'EVEN'


def compute_shot_situations(all_events, period_lengths):
    """Simulates penalty windows chronologically and returns event_id -> situation
    ('PP'/'SH'/'EVEN') for every non-scoring shot event."""
    timed = sorted(
        all_events,
        key=lambda e: abs_game_time(e.get('period'), e.get('time_sec'), period_lengths),
    )

    active = []  # list of dicts: {team, start, end, pending_next}

    def active_count(team, t):
        return sum(1 for w in active if w['team'] == team and w['start'] <= t < w['end'])

    def end_soonest(conceding_team, t):
        candidates = [w for w in active if w['team'] == conceding_team and w['start'] <= t < w['end']]
        if not candidates:
            return
        ending = min(candidates, key=lambda w: w['end'])
        pending = ending['pending_next']
        ending['end'] = t
        ending['pending_next'] = None
        if pending:
            active.append({'team': conceding_team, 'start': t, 'end': t + pending, 'pending_next': None})

    situations = {}

    for e in timed:
        t = abs_game_time(e.get('period'), e.get('time_sec'), period_lengths)
        segs = parse_penalty_segments(e.get('code'))
        if segs:
            active.append({
                'team': e.get('team'), 'start': t, 'end': t + segs[0],
                'pending_next': segs[1] if len(segs) > 1 else None,
            })
            continue
        if e.get('code') == 'maali':
            end_soonest('B' if e.get('team') == 'A' else 'A', t)
            continue
        if e.get('code') in ('laukaus', 'laukausohi', 'laukausblokattu'):
            other = 'B' if e.get('team') == 'A' else 'A'
            mine = active_count(e.get('team'), t)
            theirs = active_count(other, t)
            situations[e.get('event_id')] = 'PP' if mine < theirs else ('SH' if mine > theirs else 'EVEN')

    return situations


def find_goal_tag(all_events, shot):
    """A laukausmaali (goal-shot) shares time/period/team/player with its paired
    maali event, which carries the authoritative situation tag."""
    for e in all_events:
        if (e.get('code') == 'maali' and e.get('team') == shot.get('team')
                and e.get('period') == shot.get('period') and e.get('time') == shot.get('time')
                and e.get('player_id') == shot.get('player_id')):
            return e.get('description')
    return ''
