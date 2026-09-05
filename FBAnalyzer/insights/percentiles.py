"""Shared percentile-rank helper: where does a live/current value fall
within a HistoricalBaseline's stored distribution markers?

Used by both insights.live_insights (in-game insight evaluation) and
insights.pregame (pregame-angle selection), so "extreme" is scored the same
way in both places.
"""


def percentile_rank(value, percentiles):
    """Piecewise-linear interpolation of value's rank (0-100) among a
    HistoricalBaseline's stored markers (min, p10, p25, p50, p75, p90, max)."""
    markers = [
        (0, percentiles['min']), (10, percentiles['p10']), (25, percentiles['p25']),
        (50, percentiles['p50']), (75, percentiles['p75']), (90, percentiles['p90']),
        (100, percentiles['max']),
    ]
    if value <= markers[0][1]:
        return 0.0
    if value >= markers[-1][1]:
        return 100.0
    for (p0, v0), (p1, v1) in zip(markers, markers[1:]):
        if v0 <= value <= v1:
            if v1 == v0:
                return float(p0)
            frac = (value - v0) / (v1 - v0)
            return p0 + frac * (p1 - p0)
    return 50.0
