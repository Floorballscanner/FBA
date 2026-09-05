"""Win-probability model, ported from static/js/fliigalivegame.js's
calcDistArray() (also duplicated in static/js/fliigapage.js).

Monte Carlo simulation over each team's shots' xGOT values: every shot is
treated as an independent Bernoulli(xGOT) trial ("did this shot's quality
convert in this simulated round"), repeated n_sim times, and the win share
is the fraction of rounds each team scored more simulated goals in (ties
split 50/50).

Kept as a faithful, line-for-line port of the JS for now - it's unseeded,
so re-running it on an unchanged shot list gives a slightly different
number each time, same as the client. Switching to the exact (and
noise-free) Poisson-binomial calculation, since every shot is an
independent Bernoulli trial, is a possible future optimization but wasn't
wanted for this first port.
"""

import random

N_SIM = 5000


def compute_win_probability(team_a_xgot, team_b_xgot, n_sim=N_SIM):
    """team_a_xgot / team_b_xgot: every one of that team's shots' xGOT value
    so far (0 for off-target shots, same as the JS - they just never "convert").
    Returns (wp_a, wp_b), each a fraction of simulated rounds won."""
    c_a = 0
    c_even = 0
    c_b = 0
    for _ in range(n_sim):
        goals_a = sum(1 for xgot in team_a_xgot if random.random() < xgot)
        goals_b = sum(1 for xgot in team_b_xgot if random.random() < xgot)
        if goals_a > goals_b:
            c_a += 1
        elif goals_a == goals_b:
            c_even += 1
        else:
            c_b += 1
    wp_a = c_a / n_sim + 0.5 * c_even / n_sim
    wp_b = c_b / n_sim + 0.5 * c_even / n_sim
    return wp_a, wp_b
