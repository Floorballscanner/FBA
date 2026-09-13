"""Coarse-grid shot/goal location binning for the Team Analysis 5v5 theme's
per-line heatmaps - this app has no prior heatmap (only discrete shot-dot
rendering, see static/js/premiumfunctions.js's Draw()/redrawShotMap()), so
this is a new, self-contained utility rather than reusing anything.

Uses the same coordinate system as insights.xg_model.calc_xg: location_x in
roughly [-1000, 1000] (goalie's own view, negative = their right), location_y
in [0, HALF_COURT_Y] (0 = goal line). calc_xg itself only ever looks up shots
with y < HALF_COURT_Y (anything beyond is scored 0, i.e. not a real scoring
chance) - the rare shot logged beyond that (a clearing attempt, a misplaced
coordinate) is clamped into the last row here rather than dropped, since a
heatmap should still visually account for every shot it's summing.
"""

from .xg_model import HALF_COURT_Y, MAX_X

GRID_COLS = 10
GRID_ROWS = 10


def empty_grid():
    return [[0] * GRID_COLS for _ in range(GRID_ROWS)]


def bin_location(x, y):
    """(location_x, location_y) -> (row, col) into a GRID_ROWS x GRID_COLS
    grid, row 0 = the goal line. Returns None if either coordinate is
    missing (unlocated events - e.g. some non-shot codes - can't be binned)."""
    if x is None or y is None:
        return None
    col = int((x + MAX_X / 2) / MAX_X * GRID_COLS)
    row = int(y / HALF_COURT_Y * GRID_ROWS)
    col = max(0, min(col, GRID_COLS - 1))
    row = max(0, min(row, GRID_ROWS - 1))
    return row, col


def add_to_grid(grid, x, y):
    binned = bin_location(x, y)
    if binned is None:
        return
    row, col = binned
    grid[row][col] += 1
