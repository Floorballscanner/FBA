"""xG/xGOT lookup-matrix model for F-Liiga shots.

Canonical Python copy of the model also implemented in static/js/
fliigalivegame.js and static/js/fliigapage.js (calcxG/calcxGW) - kept in sync
by hand since there's no shared runtime between the client JS and the
server. The JS actually does branch on category (calcxG for men, calcxGW
for women, selected via match.category_id != '384') with genuinely
different matrices for each - an earlier version of this port wrongly
assumed the women's matrices were dead code and used the men's matrix for
both categories. Fixed: calc_xg now takes a category and looks up the
matching matrix pair, same as the JS.

accounts/management/commands/compute_fliiga_stats.py imports calc_xg from
here instead of keeping its own copy.

MAX_Y was wrongly set to 1700 for a while - the JS's own `maxY` constant
(static/js/fliigalivegame.js) is 3400; 1700 was mistakenly copied from that
file's "keskiviiva 1700" (center line 1700) comment instead of the variable
itself. Confirmed against real match data: recomputing a match's team xG
with MAX_Y=3400 exactly matched the client-side total, MAX_Y=1700 did not.
"""

from math import floor

MAX_Y = 3400
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


WOMEN_XG_MATRIX = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 12, 17, 19, 25, 35, 42, 30, 21, 16, 13, 9, 2],
    [3, 8, 14, 20, 27, 41, 43, 36, 23, 17, 11, 6, 2],
    [1, 3, 8, 13, 22, 29, 32, 27, 19, 11, 7, 3, 1],
    [1, 4, 7, 13, 18, 24, 25, 22, 15, 10, 6, 4, 1],
    [1, 4, 7, 10, 15, 18, 20, 17, 12, 8, 5, 3, 1],
    [1, 4, 6, 9, 12, 14, 14, 12, 9, 6, 4, 3, 1],
    [1, 3, 5, 7, 8, 11, 11, 9, 7, 6, 4, 3, 1],
    [1, 3, 4, 5, 6, 8, 8, 7, 6, 5, 4, 2, 1],
    [1, 2, 4, 4, 5, 6, 6, 6, 5, 5, 4, 2, 1],
    [1, 2, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2, 1],
    [1, 3, 4, 4, 4, 4, 5, 5, 5, 4, 3, 2, 1],
    [1, 3, 4, 3, 3, 4, 4, 4, 3, 2, 2, 1, 0],
]

WOMEN_XGOT_MATRIX = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 2, 5, 7, 15, 31, 40, 29, 17, 10, 5, 2, 0],
    [1, 4, 9, 17, 26, 39, 44, 37, 25, 17, 9, 3, 1],
    [1, 5, 14, 20, 30, 35, 37, 33, 27, 19, 13, 5, 1],
    [2, 7, 12, 21, 27, 33, 34, 31, 25, 19, 13, 7, 2],
    [3, 8, 14, 19, 25, 29, 31, 29, 23, 17, 12, 7, 2],
    [3, 8, 15, 19, 24, 26, 27, 25, 21, 15, 11, 11, 7],
    [3, 8, 13, 18, 20, 24, 25, 22, 18, 15, 11, 11, 16],
    [3, 6, 11, 15, 18, 20, 23, 20, 17, 15, 12, 10, 6],
    [2, 6, 10, 13, 15, 18, 20, 19, 16, 14, 10, 6, 2],
    [2, 7, 11, 12, 14, 16, 19, 18, 15, 12, 9, 6, 2],
    [3, 8, 11, 10, 12, 14, 16, 16, 14, 9, 7, 5, 2],
    [2, 6, 6, 6, 7, 9, 10, 11, 8, 5, 3, 3, 2],
]

MATRICES_BY_CATEGORY = {
    'men': (XG_MATRIX, XGOT_MATRIX),
    'women': (WOMEN_XG_MATRIX, WOMEN_XGOT_MATRIX),
}


def calc_xg(x, y, category='men'):
    xg_matrix, xgot_matrix = MATRICES_BY_CATEGORY.get(category, MATRICES_BY_CATEGORY['men'])
    x = 1000 + x
    if y >= MAX_Y:
        y = MAX_Y - 1
    yd = 2 + floor(y / MAX_Y * 12)
    xd = floor(x / MAX_X * 12)
    yd = max(0, min(yd, len(xg_matrix) - 1))
    xd = max(0, min(xd, len(xg_matrix[0]) - 1))
    return {'xGOT': xgot_matrix[yd][xd] / 100, 'xG': xg_matrix[yd][xd] / 100}
