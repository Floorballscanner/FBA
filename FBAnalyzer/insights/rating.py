"""Shared 0-100 player/goalie rating weights.

Forwards and defense are rated within their own pool, on their own metric
weights, never compared to each other on one flat scale - every reference
system from other sports does the same (PFF grades, soccer's PlayeRank, NHL
WAR/GSAx-based models): a defenseman's points-per-game sits at a
structurally lower scale than a forward's, so comparing them directly would
just reward playing forward. See insights.lineups.ROLE_LABELS for what each
role abbreviation means, and FORWARD_ROLES/DEFENSE_ROLES there for the
grouping itself.

Used by two different callers against two different populations:
  - accounts.management.commands.compute_fliiga_stats._rate_skaters/
    _rate_goalies: one Rating per player per season, percentile-ranked
    against that season's own in-memory player pool.
  - insights.game_stars.compute_game_stars: one rating per player per single
    game, percentile-ranked against a HistoricalBaseline of per-game-instance
    values (insights.management.commands.compute_baselines).
Both blend the same weights against whichever population/scope is being
rated - kept here so the two can never drift apart.
"""

FORWARD_WEIGHTS = {
    'points_per_game': 0.35, 'xg5v5_per_game': 0.30, 'plus_minus_per_game': 0.20, 'gaxg_per_game': 0.15,
}
DEFENSE_WEIGHTS = {
    'plus_minus_per_game': 0.40, 'points_per_game': 0.30, 'xg5v5_per_game': 0.20, 'gaxg_per_game': 0.10,
}
# GAxG (goals vs. expected) gets a modest, role-scaled weight: insights.live_insights treats
# this exact quantity as "luck" (xg_over_under's own framing) for a single game, but summed
# over a whole season it tempers enough to carry some real finishing-skill signal - not on par
# with the other three metrics, so it stays the smallest weight, and larger for forwards than
# defense since forwards' much bigger shot volume (confirmed with real 2024-2025 data: forward
# per-game GAxG spreads roughly 3x wider than defense's, p90 0.21 vs 0.10) gives their GAxG a
# less noisy sample to begin with. Shot volume itself is still excluded - redundant with xG5v5,
# which already reflects shot quality *and* implies volume; including both would double-count.
GOALIE_WEIGHTS = {'gsax': 0.70, 'saveperc': 0.30}  # GSAx is already shot-quality-adjusted and
# weighted higher than the unadjusted save%. 'gsax' means different things to the two callers -
# the season Rating uses a per-60-minutes rate (GSAx60, real ice time via goalie_stints - see
# compute_fliiga_stats.py); the per-game rating uses a simpler raw per-game GSAx (xGOT faced -
# GA that game, no ice-time normalization - see insights.game_stars) since a single game rarely
# has enough of a partial-appearance split to need it, and reconstructing real ice time from
# MatchEvent/MatchLineup alone (rather than the raw Torneopal match payload compute_fliiga_stats.py
# has) isn't worth the complexity for one game's worth of signal. Same weight, same key name,
# different underlying quantity per caller - kept as one shared dict so the 70/30 split itself
# can't drift between the two, with each caller responsible for building its own 'gsax' value.
