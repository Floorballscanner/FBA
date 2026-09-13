"""Torneopal event `code` vocabulary, shared across ingestion, post-game
analysis, baseline computation, and live insight evaluation - so the
definition of "a shot" or "a goal" can't drift between them.
"""

SHOT_CODES = {'laukaus', 'laukausohi', 'laukausblokattu', 'laukausmaali'}
ON_TARGET_CODES = {'laukaus', 'laukausmaali'}
GOAL_CODE = 'laukausmaali'
ASSIST_CODE = 'syotto'
GOALIE_CODES = {'torjunta', 'paastetty'}
GOAL_AGAINST_CODE = 'paastetty'

# Torneopal's own placeholder "no player" sentinel - confirmed live 2026-09-13:
# always paired with an empty player_name, used system-wide (goalie-change,
# unassisted-goal "assist", period-restart events, and rarely even a goal
# itself) whenever an event has no specific player attached. player_id is
# otherwise truthy-checked (`if event.player_id`), which this string is too -
# so anywhere events get attributed to an individual player, also exclude
# this sentinel or it aggregates into a blank-named "player".
NO_PLAYER_ID = '1'
