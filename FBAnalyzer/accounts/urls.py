"""

This is where Django views and HTML - paths are joined.
Views are defined in the views.py -file
Accounts pathname refers to the inlogged user, path is the url-name
Views.function is called when a html - page is rendered

"""

from django.urls import path, include
from accounts import views
from .views import UserViewSet, TeamViewSet, GameViewSet, PlayerViewSet, TeamList
from rest_framework import routers


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'livejson', GameViewSet)
router.register(r'teamlist', TeamList)

urlpatterns = [
    path('accounts', views.index, name="home"),
    path('accounts/new_game/', views.new_game, name="new-game"),
    path('accounts/premium_game/', views.premium_game, name="new-game-premium"),
    path('accounts/premium_game/get_teams/', views.get_teams, name="get-teams"),
    path('accounts/premium_game/get_players', views.get_players, name="get-players"),
    path('accounts/my_team/', views.my_team, name="my-team"),
    path('accounts/my_team/add_new_player/', views.add_new_player, name="add-new-player"),
    path('', include(router.urls)),
]