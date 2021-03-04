from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('accounts', views.index, name="home"),
    path('accounts/sign_up/', views.sign_up, name="sign-up"),
    path('accounts/new_game/', views.new_game, name="new-game"),
]