"""Win-probability model, computed server-side for insights.ingest.ingest_match_tick
(the "Biggest win-probability swing" insight type, see insights.live_insights) and for
insights.pregame's pregame favorite/win-probability angle - a separate computation from
static/js/fliigalivegame.js's own calcDistArray(), which still does its own client-side
Monte Carlo simulation purely for that page's live scoreboard display and isn't affected
by anything here.

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

from math import exp, factorial


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


def _win_share_from_distributions(dist_a, dist_b):
    """dist_a/dist_b: each team's P(exactly k goals) for k = 0, 1, 2, ...
    Returns (wp_a, wp_b), each team's exact win share (ties split 50/50)."""
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


def compute_win_probability(team_a_xgot, team_b_xgot):
    """team_a_xgot / team_b_xgot: every one of that team's shots' xGOT value
    so far (0 for off-target shots - they just never "convert").
    Returns (wp_a, wp_b), each team's exact win share (ties split 50/50)."""
    dist_a = _goal_distribution(team_a_xgot)
    dist_b = _goal_distribution(team_b_xgot)
    return _win_share_from_distributions(dist_a, dist_b)


def _poisson_distribution(lam, max_goals=12):
    """P(exactly k goals) for k = 0..max_goals, goals Poisson(lam) - used
    pregame, when there are no shots yet to build a Poisson-binomial
    distribution from (see compute_win_probability above), only each team's
    season-to-date goals-per-game rate. Tail probability beyond max_goals
    (negligible for realistic floorball scoring rates) is folded into the
    last bucket so the distribution still sums to exactly 1."""
    dist = [exp(-lam) * lam ** k / factorial(k) for k in range(max_goals + 1)]
    dist[-1] += max(0.0, 1 - sum(dist))
    return dist


def compute_pregame_win_probability(lambda_a, lambda_b):
    """lambda_a / lambda_b: each team's projected goals for tonight (see
    insights.pregame - blended from their own attack and the opponent's
    defense). Returns (wp_a, wp_b), same shape as compute_win_probability."""
    dist_a = _poisson_distribution(lambda_a)
    dist_b = _poisson_distribution(lambda_b)
    return _win_share_from_distributions(dist_a, dist_b)
