"""Deterministic phrasing variation: picks one of several equivalent
sentence templates for the same underlying fact, so the same angle (e.g.
"goalie is hot") doesn't render identical text across every match it fires
for. Deterministic per seed (typically match_id + angle key + team) so
recomputing the same match's analysis twice still gives the same text -
only different matches/teams see different phrasing.
"""

import hashlib


def vary(seed, options):
    """Picks one of `options` based on a stable hash of `seed`."""
    digest = hashlib.md5(seed.encode()).hexdigest()
    return options[int(digest, 16) % len(options)]


def plural(n, singular, plural_form=None):
    """singular/plural word for n, e.g. plural(1, 'game') -> 'game',
    plural(4, 'game') -> 'games'. A team's very first game of a season
    would otherwise render as "their last 1 games"."""
    if n == 1:
        return singular
    return plural_form or (singular + 's')
