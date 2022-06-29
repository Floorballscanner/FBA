"""Floorball Scanner URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from accounts import urls as accounts_urls
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.homepage, name="frontpage"),
    path('login/', views.login),
    path('about/', views.about),
    path('', include("accounts.urls")),
    path('accounts/', include('django.contrib.auth.urls')),
    path('signup/', views.signup, name="sign-up"),
    path('sitemap', views.sitemap, name="sitemap"),
    path('apis/', include(accounts_urls)),
    path('live/', views.live, name="livepage"),
    path('live/game/', views.game, name="gamepage"),
]

urlpatterns += staticfiles_urlpatterns()
