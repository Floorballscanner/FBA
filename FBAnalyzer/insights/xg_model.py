"""xG/xGOT lookup-matrix model for F-Liiga shots.

Canonical Python copy of the model also implemented in static/js/
fliigalivegame.js and static/js/fliigapage.js (calcxG/calcxGW) - kept in sync
by hand since there's no shared runtime between the client JS and the
server.

accounts/management/commands/compute_fliiga_stats.py imports calc_xg from
here instead of keeping its own copy.

The client JS's own `maxY = 3400` constant (static/js/fliigalivegame.js) was
doing two unrelated jobs that needed two different numbers: 3400 is
(approximately) the outer bound of what Torneopal's location_y ever reports
- confirmed against real data, the observed max across 100k+ shots is 3425 -
but it was also being used as the divisor that turns y into a matrix row,
which was never the intent. The intent (confirmed with the model's author):
half court is at y=1700, y=1700 should land on row yd=13, and anything at or
beyond half court should be xG=0, not a matrix lookup. HALF_COURT_Y=1700
below is that fix: shots at or beyond it return 0 outright instead of being
clamped into row 13's real (non-zero) value.

The single matrix per category was also replaced with situational ones -
analysis of three real seasons (2023-24 through 2025-26) confirmed genuinely
different scoring patterns for 5v5 vs. power play (PP converts meaningfully
above 5v5 for men, essentially flat for women) vs. 6v5/pulled-goalie
(converts *below* 5v5 for both, despite the numbers advantage - defenses
collapse the middle to protect the empty net). The 12 matrices themselves
(men/women x 5v5/PP/6v5 x xG/xGOT) live in insights/refined_xg_matrices.py,
built via angle-and-distance-aware adaptive kernel smoothing of real shot
data rather than hand-estimated - see that module's docstring for the
smoothing methodology, and the "Situational xG Calibration" artifact from
this session for the full before/after analysis. Shorthanded (SH) shots
(~1% of volume) fall back to the 5v5 matrix rather than getting their own -
not enough independent value in a fourth, even-sparser matrix.
"""

from math import floor

from .refined_xg_matrices import (
    MEN_5V5_XG_MATRIX, MEN_5V5_XGOT_MATRIX, MEN_PP_XG_MATRIX, MEN_PP_XGOT_MATRIX,
    MEN_6V5_XG_MATRIX, MEN_6V5_XGOT_MATRIX,
    WOMEN_5V5_XG_MATRIX, WOMEN_5V5_XGOT_MATRIX, WOMEN_PP_XG_MATRIX, WOMEN_PP_XGOT_MATRIX,
    WOMEN_6V5_XG_MATRIX, WOMEN_6V5_XGOT_MATRIX,
)

HALF_COURT_Y = 1700  # goal line (0) to half court; at or beyond this, xG is 0
MAX_X = 2000

# situation as reported by insights.special_teams.compute_shot_situations
# ('PP'/'SH'/'EVEN'/'6V5') -> which matrix bucket to use. SH has no matrix of
# its own; EVEN and any unrecognised/blank value fall back to 5v5 too.
SITUATION_BUCKET = {'PP': 'PP', '6V5': '6v5', 'EVEN': '5v5', 'SH': '5v5'}

MATRICES_BY_CATEGORY_SITUATION = {
    ('men', '5v5'): (MEN_5V5_XG_MATRIX, MEN_5V5_XGOT_MATRIX),
    ('men', 'PP'): (MEN_PP_XG_MATRIX, MEN_PP_XGOT_MATRIX),
    ('men', '6v5'): (MEN_6V5_XG_MATRIX, MEN_6V5_XGOT_MATRIX),
    ('women', '5v5'): (WOMEN_5V5_XG_MATRIX, WOMEN_5V5_XGOT_MATRIX),
    ('women', 'PP'): (WOMEN_PP_XG_MATRIX, WOMEN_PP_XGOT_MATRIX),
    ('women', '6v5'): (WOMEN_6V5_XG_MATRIX, WOMEN_6V5_XGOT_MATRIX),
}


def calc_xg(x, y, category='men', situation='5v5'):
    if y >= HALF_COURT_Y:
        return {'xGOT': 0.0, 'xG': 0.0}
    bucket = SITUATION_BUCKET.get(situation, '5v5')
    key = (category, bucket) if (category, bucket) in MATRICES_BY_CATEGORY_SITUATION else ('men', bucket)
    xg_matrix, xgot_matrix = MATRICES_BY_CATEGORY_SITUATION[key]
    x = 1000 + x
    yd = 2 + floor(y / HALF_COURT_Y * 12)
    xd = floor(x / MAX_X * 12)
    yd = max(0, min(yd, len(xg_matrix) - 1))
    xd = max(0, min(xd, len(xg_matrix[0]) - 1))
    return {'xGOT': xgot_matrix[yd][xd] / 100, 'xG': xg_matrix[yd][xd] / 100}
