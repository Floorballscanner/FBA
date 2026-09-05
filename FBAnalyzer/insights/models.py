"""Models for the F-Liiga insight engine.

These are deliberately separate from accounts.Game/Shot/Time/Player, which
serve the app's own manual shot-tagging tool and use Torneopal-unrelated IDs.
Everything here is keyed on Torneopal's own match_id/event_id/team_id/
player_id (strings, per Torneopal's own API), not on those other models.

MatchEvent is the durable event log: both the historical backfill and the
live client-push path write into the same table, keyed uniquely on
(match_id, event_id) so a duplicate push from a second viewer's browser is
a harmless no-op rather than a duplicate row.

MatchState is the durable "hot" per-match running state - what would have
been a Redis cache in a backend-polling design. Since the client-push
architecture only writes a handful of times a minute across a handful of
concurrently-live games, a plain Postgres row is enough; no cache layer needed.

Insight (append-only, many rows per match) is the live, tick-by-tick log.
PregameAnalysis and PostGameAnalysis are each one row per match - a single
set of facts computed once (lazily, on first request, if no scheduled job
has gotten to it yet) rather than a continuous stream.

HistoricalBaseline holds the percentile distributions insight evaluation
compares live state against, recomputed nightly from MatchEvent history.
"""

from django.db import models


class MatchEvent(models.Model):
    CATEGORY_CHOICES = [('men', 'Men'), ('women', 'Women')]
    SITUATION_CHOICES = [('PP', 'Powerplay'), ('SH', 'Shorthanded'), ('EVEN', 'Even strength')]

    match_id = models.CharField(max_length=20)
    event_id = models.CharField(max_length=20)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)

    code = models.CharField(max_length=30)
    team = models.CharField(max_length=1, blank=True)  # Torneopal's 'A'/'B'
    team_id = models.CharField(max_length=20, blank=True)
    player_id = models.CharField(max_length=20, blank=True)

    period = models.PositiveSmallIntegerField(null=True, blank=True)
    time_sec = models.PositiveIntegerField(null=True, blank=True)  # period-relative
    abs_time_sec = models.PositiveIntegerField(null=True, blank=True)  # game-relative

    description = models.CharField(max_length=100, blank=True)
    location_x = models.FloatField(null=True, blank=True)
    location_y = models.FloatField(null=True, blank=True)

    xg = models.DecimalField(max_digits=5, decimal_places=3, null=True, blank=True)
    xgot = models.DecimalField(max_digits=5, decimal_places=3, null=True, blank=True)
    situation = models.CharField(max_length=4, choices=SITUATION_CHOICES, blank=True)

    raw = models.JSONField(default=dict, blank=True)  # full event payload, for anything not modeled above

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['match_id', 'event_id'], name='unique_match_event'),
        ]
        indexes = [
            models.Index(fields=['match_id', 'abs_time_sec']),
        ]

    def __str__(self):
        return f'{self.match_id}/{self.event_id} {self.code}'


class MatchState(models.Model):
    STATUS_CHOICES = [('scheduled', 'Scheduled'), ('live', 'Live'), ('played', 'Played')]
    STAGE_CHOICES = [('regular', 'Regular season'), ('playoffs', 'Playoffs')]

    match_id = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=10, choices=MatchEvent.CATEGORY_CHOICES)
    season_id = models.CharField(max_length=20, blank=True)  # e.g. '2025-2026', straight from Torneopal
    stage = models.CharField(max_length=10, choices=STAGE_CHOICES, blank=True)
    date = models.DateField(null=True, blank=True)  # calendar date of the match, for chronological ordering
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='scheduled')

    team_a_id = models.CharField(max_length=20, blank=True)
    team_b_id = models.CharField(max_length=20, blank=True)
    team_a_name = models.CharField(max_length=100, blank=True)
    team_b_name = models.CharField(max_length=100, blank=True)

    period = models.PositiveSmallIntegerField(null=True, blank=True)
    score_a = models.PositiveSmallIntegerField(default=0)
    score_b = models.PositiveSmallIntegerField(default=0)
    xg_a = models.DecimalField(max_digits=6, decimal_places=3, default=0)
    xg_b = models.DecimalField(max_digits=6, decimal_places=3, default=0)
    xgot_a = models.DecimalField(max_digits=6, decimal_places=3, default=0)
    xgot_b = models.DecimalField(max_digits=6, decimal_places=3, default=0)
    wp_a = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    wp_b = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)

    last_event_abs_time = models.PositiveIntegerField(null=True, blank=True)
    last_evaluated_at = models.DateTimeField(null=True, blank=True)  # drives the 60s insight-eval gate
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.match_id}: {self.team_a_name} {self.score_a}-{self.score_b} {self.team_b_name} ({self.status})'


class Insight(models.Model):
    INSIGHT_TYPE_CHOICES = [
        ('xg_over_under', 'xG over/underperformance'),
        ('xg_momentum', 'Trailing-window xG momentum'),
        ('standout_performer', 'Standout performer vs season pace'),
        ('goalie_gsax', 'Goalie GSAx'),
        ('wp_swing', 'Biggest win-probability swing'),
        ('special_teams_rate', 'In-game special-teams rate vs league average'),
    ]

    match_id = models.CharField(max_length=20)
    insight_type = models.CharField(max_length=30, choices=INSIGHT_TYPE_CHOICES)
    payload = models.JSONField(default=dict, blank=True)  # facts backing the insight
    text = models.TextField(blank=True)  # template-rendered phrasing
    score = models.DecimalField(max_digits=6, decimal_places=3, default=0)  # candidate-selection score

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['match_id', 'created_at']),
        ]

    def __str__(self):
        return f'{self.match_id} {self.insight_type} ({self.created_at:%H:%M:%S})'


class PregameAnalysis(models.Model):
    match_id = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=10, choices=MatchEvent.CATEGORY_CHOICES)
    facts = models.JSONField(default=dict, blank=True)
    text = models.TextField(blank=True)
    is_final = models.BooleanField(default=False)  # locks once the game starts
    computed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Pregame {self.match_id}{" (final)" if self.is_final else ""}'


class PostGameAnalysis(models.Model):
    match_id = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=10, choices=MatchEvent.CATEGORY_CHOICES)
    facts = models.JSONField(default=dict, blank=True)
    text = models.TextField(blank=True)
    computed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Post-game {self.match_id}'


class HistoricalBaseline(models.Model):
    STAGE_CHOICES = [('regular', 'Regular season'), ('playoffs', 'Playoffs')]

    baseline_type = models.CharField(max_length=30)  # matches Insight.INSIGHT_TYPE_CHOICES keys
    category = models.CharField(max_length=10, choices=MatchEvent.CATEGORY_CHOICES)
    stage = models.CharField(max_length=10, choices=STAGE_CHOICES)
    percentiles = models.JSONField(default=dict, blank=True)
    sample_size = models.PositiveIntegerField(default=0)
    computed_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['baseline_type', 'category', 'stage'], name='unique_baseline_combo'
            )
        ]

    def __str__(self):
        return f'{self.baseline_type} {self.category} {self.stage} (n={self.sample_size})'
