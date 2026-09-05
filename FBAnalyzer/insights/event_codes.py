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
