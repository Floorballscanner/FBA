"""Win-probability model, computed server-side for insights.ingest.ingest_match_tick
(the "Biggest win-probability swing" insight type, see insights.live_insights) - a
separate computation from static/js/fliigalivegame.js's own calcDistArray(), which
still does its own client-side Monte Carlo simulation purely for that page's live
scoreboard display and isn't affected by anything here.

Exact Poisson-binomial calculation instead of Monte Carlo sampling: each shot is an
independent Bernoulli(xGOT) trial ("did this shot's quality convert"), so a team's
goals-scored distribution is the exact, closed-form Poisson-binomial distribution of
those trials - computable directly via the standard DP (build the distribution one
shot at a time: convolve the current distribution with the new shot's own two-outcome
distribution). This used to be a 5,000-round Monte Carlo simulation (unseeded, so a
noisy, slightly-different answer each call on an unchanged shot list) - the exact
calculation is both deterministic and, for realistic shot counts, dramatically
cheaper: O(shots_a + shots_b + shots_a * shots_b) instead of O(n_sim * shots). The
Monte Carlo version's cost was a major contributor to the response-time degradation
during the first live game (recomputed from scratch on every ~10s poll, by every
concurrent viewer independently - see git history around this comment).
"""


def _goal_distribution(xgot_values):
    """dist[k] = P(exactly k goals), built one shot at a time."""
    dist = [1.0]
    for p in xgot_values:
        next_dist = [0.0] * (len(dist) + 1)
        for k, prob in enumerate(dist):
            next_dist[k] += prob * (1 - p)
            next_dist[k + 1] += prob * p
        dist = next_dist
    return dist


def compute_win_probability(team_a_xgot, team_b_xgot):
    """team_a_xgot / team_b_xgot: every one of that team's shots' xGOT value
    so far (0 for off-target shots - they just never "convert").
    Returns (wp_a, wp_b), each team's exact win share (ties split 50/50)."""
    dist_a = _goal_distribution(team_a_xgot)
    dist_b = _goal_distribution(team_b_xgot)

    wp_a = wp_even = 0.0
    for i, pa in enumerate(dist_a):
        for j, pb in enumerate(dist_b):
            if i > j:
                wp_a += pa * pb
            elif i == j:
                wp_even += pa * pb
    # dist_a and dist_b each sum to 1, so the pa*pb mass over every (i, j)
    # pair sums to 1 too - whatever isn't wp_a or a tie is team B's win share.
    wp_b = 1.0 - wp_a - wp_even
    return wp_a + 0.5 * wp_even, wp_b + 0.5 * wp_even
