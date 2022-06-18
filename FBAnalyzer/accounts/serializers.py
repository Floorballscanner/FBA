
from rest_framework import serializers
from . models import Live, Team
from django.contrib.auth.models import User

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'is_staff']

class LiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Live
        fields = ['data', ]

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['name', 'lineOn', 'possessionPeriod', 'possessionGame', 'goalsPeriod', 'goalsGame', 'xgPeriod',
                  'xgGame']
