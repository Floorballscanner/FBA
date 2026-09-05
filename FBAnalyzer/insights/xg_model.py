"""xG/xGOT lookup-matrix model for F-Liiga shots.

Canonical Python copy of the model also implemented in static/js/
fliigalivegame.js and static/js/fliigapage.js (calcxG/calcxGW) - kept in sync
by hand since there's no shared runtime between the client JS and the
server. Women's matches currently use the same matrix as men's too (the JS
has unused women's matrices behind a commented-out branch) - preserved as-is,
not a bug introduced by this port.

accounts/management/commands/compute_fliiga_stats.py imports calc_xg from
here instead of keeping its own copy.
"""

from math import floor

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
