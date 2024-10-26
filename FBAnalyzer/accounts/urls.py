"""

This is where Django views and HTML - paths are joined.
Views are defined in the views.py -file
Accounts pathname refers to the inlogged user, path is the url-name
Views.function is called when a html - page is rendered

"""

from django.urls import path, include
from accounts import views
from .views import UserViewSet, TeamViewSet, GameViewSet, PlayerViewSet, PositionViewSet
from .views import LevelViewSet, LineViewSet, LiveDataViewSet, ShotViewSet, TimeViewSet
from rest_framework import routers


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'lines', LineViewSet)
router.register(r'games', GameViewSet)
router.register(r'levels', LevelViewSet)
router.register(r'shots', ShotViewSet)
router.register(r'times', TimeViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'livedata', LiveDataViewSet)

urlpatterns = [
    path('accounts', views.index, name="home"),
    path('accounts/new_game/', views.new_game, name="new-game"),
    path('accounts/premium_game/', views.premium_game, name="new-game-premium"),
    path('accounts/edit_players/', views.edit_players, name="edit-players"),
    path('accounts/edit_teams/', views.edit_teams, name="edit-teams"),
    path('accounts/edit_levels/', views.edit_levels, name="edit-levels"),
    path('accounts/edit_data/', views.edit_data, name="edit-data"),
    path('accounts/analyse/', views.analyse, name="analyse-data"),
    path('accounts/test/', views.test_environment, name="test-environment"),
    path('accounts/update_info/', views.update_info, name="update-info"),
    path('accounts/premium_analysis/', views.premium_analysis, name="premium-analysis"),
    path('accounts/saved_games/', views.saved_games, name="saved-games"),
    path('accounts/fliigalive/', views.fliigalive, name="fliigalivepage"),
    path('accounts/fliigalive/<nr>', views.fliigagame, name="fliigagamepage"),
    path('accounts/fliiga_results/', views.fliiga_results, name="fliiga-results"),
    path('accounts/fliiga/', views.fliiga_main, name="fliiga-main"),
    path('lite/', views.lite, name="lite-game"),
    path('apis/teamlist/', views.TeamList.as_view(), name="team-list"),
    path('apis/playerlist/', views.PlayerList.as_view(), name="player-list"),
    path('apis/gamelist/', views.GameList.as_view(), name="game-list"),
    path('accounts/my_team/add_new_player/', views.add_new_player, name="add-new-player"),
    path('accounts/players/update/<uuid:pk>/', views.UpdatePlayer.as_view(), name='player-update'),
    path('', include(router.urls)),
]