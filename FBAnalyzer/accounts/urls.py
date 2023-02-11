"""

This is where Django views and HTML - paths are joined.
Views are defined in the views.py -file
Accounts pathname refers to the inlogged user, path is the url-name
Views.function is called when a html - page is rendered

"""

from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('accounts', views.index, name="home"),
    path('accounts/sign_up/', views.sign_up, name="sign-up"),
    path('accounts/new_game/', views.new_game, name="new-game"),
    path('accounts/my_team/', views.my_team, name="my-team"),
    path('accounts/my_team/add_new_player/', views.add_new_player, name="add-new-player"),
    path('accounts/analyse_data/', views.analyse, name="analyse-data"),
]