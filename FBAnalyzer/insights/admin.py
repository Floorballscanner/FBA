from django.contrib import admin

from .models import MatchEvent, MatchState, Insight, PregameAnalysis, PostGameAnalysis, HistoricalBaseline


@admin.register(MatchEvent)
class MatchEventAdmin(admin.ModelAdmin):
    list_display = ('match_id', 'code', 'team', 'period', 'time_sec', 'situation')
    list_filter = ('category', 'code', 'situation')
    search_fields = ('match_id', 'event_id', 'player_id')


@admin.register(MatchState)
class MatchStateAdmin(admin.ModelAdmin):
    list_display = ('match_id', 'team_a_name', 'score_a', 'score_b', 'team_b_name', 'status', 'updated_at')
    list_filter = ('category', 'status')
    search_fields = ('match_id', 'team_a_name', 'team_b_name')


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ('match_id', 'insight_type', 'score', 'created_at')
    list_filter = ('insight_type',)
    search_fields = ('match_id',)


@admin.register(PregameAnalysis)
class PregameAnalysisAdmin(admin.ModelAdmin):
    list_display = ('match_id', 'is_final', 'computed_at')
    list_filter = ('category', 'is_final')
    search_fields = ('match_id',)


@admin.register(PostGameAnalysis)
class PostGameAnalysisAdmin(admin.ModelAdmin):
    list_display = ('match_id', 'computed_at')
    list_filter = ('category',)
    search_fields = ('match_id',)


@admin.register(HistoricalBaseline)
class HistoricalBaselineAdmin(admin.ModelAdmin):
    list_display = ('baseline_type', 'category', 'stage', 'sample_size', 'computed_at')
    list_filter = ('category', 'stage')
