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
    path('live/<nr>', views.game, name="gamepage"),
    path('fliigalive/', views.fliigalive, name="fliigalivepage"),
    path('fliigalive/<nr>', views.fliigagame, name="fliigagamepage"),
    path('references/', views.references, name="references"),
    path('fliiga_results/', views.fliiga_results, name="fliiga-results"),
    path('fliiga/', views.fliiga_main, name="fliiga-main"),
    path('inssidivari/', views.fliiga_main, name="inssidivari-main"),
    path('inssidivari_results/', views.inssidivari_results, name="inssidivari-results"),
    path('inssidivarilive/', views.inssidivarilive, name="idlivepage"),
    path('inssidivarilive/<nr>', views.inssidivarigame, name="idgamepage"),
]

urlpatterns += staticfiles_urlpatterns()
