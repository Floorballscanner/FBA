"""Floorball Scanner URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
import analyzer
from analyzer import views
from accounts import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'is_staff']

# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'live', views.LiveViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', analyzer.views.homepage, name="frontpage"),
    path('login/', views.login),
    path('about/', analyzer.views.about),
    path('', include("accounts.urls")),
    path('accounts/', include('django.contrib.auth.urls')),
    path('live/', analyzer.views.live),
    path('signup/', analyzer.views.signup, name="sign-up"),
    path('sitemap', analyzer.views.sitemap, name="sitemap"),
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

urlpatterns += staticfiles_urlpatterns()
