
from rest_framework import serializers
from . models import Team, Game, Player, Position, Line, LiveData, Level, Shot, Time
from django.contrib.auth.models import User

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'is_staff']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['url', 'id', 'name', 'level', 'isSenior', 'isMen', 'isNational', 'created']

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['url', 'id', 'abbr', 'name']

class LineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Line
        fields = ['url', 'id', 'abbr', 'name']

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['url', 'id', 'date', 'user', 'teams']

class PlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Player
        fields = ['url', 'id', 'first_name', 'last_name', 'jersey_number', 'team', 'line', 'position', 'created']

class LevelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Level
        fields = ['url', 'id', 'name', 'country', 'isSenior', 'isMale', 'isNational', 'created']

class ShotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Shot
        fields = '__all__'

class TimeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Time
        fields = '__all__'

class PlayerUpdateSerializer(serializers.ModelSerializer):
    line = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    position = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Player
        fields = ['line', 'position']

class LiveDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveData
        fields = '__all__'
