"""Floorball Scanner URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from accounts import urls as accounts_urls
from accounts import views as accounts_views
from accounts import stripe_views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.homepage, name="frontpage"),
    path('login/', views.login),
    path('', include("accounts.urls")),
    path('accounts/', include('django.contrib.auth.urls')),
    path('signup/', views.signup, name="sign-up"),
    path('get-started/', views.get_started, name="get-started"),
    path('trial/', accounts_views.start_trial, name="start-trial"),
    path('trial-expired/', accounts_views.trial_expired, name="trial-expired"),
    # 'buy/success/' must come before 'buy/<str:tier>/' — otherwise it'd match the
    # tier-capturing pattern first, with tier='success'.
    path('buy/success/', stripe_views.checkout_success, name="stripe-checkout-success"),
    path('buy/<str:tier>/', stripe_views.start_checkout, name="stripe-checkout"),
    path('stripe/webhook/', stripe_views.stripe_webhook, name="stripe-webhook"),
    path('sitemap', views.sitemap, name="sitemap"),
    path('apis/', include(accounts_urls)),
    path('apis/insights/', include('insights.urls')),
    path('live/', views.live, name="livepage"),
    path('live/<nr>', views.game, name="gamepage"),
    path('fliigalive/', views.fliigalive_front, name="fliigalivepage_front"),
    # path('fliigalive/<nr>', views.fliigagame, name="fliigagamepage"),
    path('references/', views.references, name="references"),
    path('f-liiga/', views.fliiga_product, name="fliiga-product"),
    path('f-liiga/trial/', accounts_views.start_fliiga_trial, name="start-fliiga-trial"),
    path('f-liiga/trial-expired/', accounts_views.fliiga_trial_expired, name="fliiga-trial-expired"),
    # path('fliiga_results/', views.fliiga_results, name="fliiga-results"),
    # path('inssidivari/', views.inssidivari_main, name="inssidivari-main"),
    # path('inssidivari_results/', views.inssidivari_results, name="inssidivari-results"),
    # path('inssidivarilive/', views.inssidivarilive, name="idlivepage"),
    # path('testilive/', views.testilive, name="testilivepage"),
    # path('inssidivarilive/<nr>', views.inssidivarigame, name="idgamepage"),
]

urlpatterns += staticfiles_urlpatterns()
