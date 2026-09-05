from django.urls import path

from . import views

urlpatterns = [
    path('events/', views.ingest_match_events, name='insights-ingest-events'),
    path('pregame/<str:match_id>/', views.pregame_analysis, name='insights-pregame'),
    path('postgame/<str:match_id>/', views.post_game_analysis, name='insights-postgame'),
    path('live/<str:match_id>/', views.live_insights, name='insights-live'),
]
