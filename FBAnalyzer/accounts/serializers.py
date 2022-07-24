
from rest_framework import serializers
from . models import Team, Game, Player
from django.contrib.auth.models import User

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'is_staff']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['url', 'id', 'name', 'level', 'isSenior', 'isMen', 'isNational']

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['url', 'id', 'first_name', 'last_name', 'jersey_number', 'team', 'line', 'position']

        def update(self, instance, validated_data):
            instance.line = validated_data.get('line', instance.line)
            instance.position = validated_data.get('position', instance.position)
            instance.save()
            return instance

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [

            'url', 'date', 'periodNr', 'gameClock', 'periodClock', 'nameT1', 'lineOnT1', 'possessionPeriodT1',
            'possessionGameT1', 'goalsPeriodT1', 'goalsGameT1', 'xGPeriodT1', 'xGGameT1', 'nameT2', 'lineOnT2',
            'possessionPeriodT2', 'possessionGameT2', 'goalsPeriodT2', 'goalsGameT2', 'xGPeriodT2', 'xGGameT2',
            'nameL1', 'possessionPeriodT1L1', 'possessionGameT1L1', 'gfPeriodT1L1', 'gfGameT1L1', 'gaPeriodT1L1',
            'gaGameT1L1', 'TOCPeriodT1L1', 'TOCGameT1L1', 'xGfPeriodT1L1', 'xGfGameT1L1', 'xGaPeriodT1L1',
            'xGaGameT1L1', 'possessionPeriodT2L1', 'possessionGameT2L1', 'gfPeriodT2L1', 'gfGameT2L1', 'gaPeriodT2L1',
            'gaGameT2L1', 'TOCPeriodT2L1', 'TOCGameT2L1', 'xGfPeriodT2L1', 'xGfGameT2L1', 'xGaPeriodT2L1', 'xGaGameT2L1', 'nameL2',
            'possessionPeriodT1L2', 'possessionGameT1L2' , 'gfPeriodT1L2' , 'gfGameT1L2' , 'gaPeriodT1L2' , 'gaGameT1L2',
            'TOCPeriodT1L2', 'TOCGameT1L2', 'xGfPeriodT1L2', 'xGfGameT1L2', 'xGaPeriodT1L2', 'xGaGameT1L2', 'possessionPeriodT2L2',
            'possessionGameT2L2', 'gfPeriodT2L2', 'gfGameT2L2', 'gaPeriodT2L2', 'gaGameT2L2', 'TOCPeriodT2L2', 'TOCGameT2L2',
            'xGfPeriodT2L2', 'xGfGameT2L2', 'xGaPeriodT2L2', 'xGaGameT2L2', 'nameL3', 'possessionPeriodT1L3', 'possessionGameT1L3',
            'gfPeriodT1L3', 'gfGameT1L3', 'gaPeriodT1L3', 'gaGameT1L3', 'TOCPeriodT1L3', 'TOCGameT1L3', 'xGfPeriodT1L3',
            'xGfGameT1L3', 'xGaPeriodT1L3', 'xGaGameT1L3', 'possessionPeriodT2L3', 'possessionGameT2L3', 'gfPeriodT2L3',
            'gfGameT2L3', 'gaPeriodT2L3', 'gaGameT2L3', 'TOCPeriodT2L3', 'TOCGameT2L3', 'xGfPeriodT2L3', 'xGfGameT2L3',
            'xGaPeriodT2L3', 'xGaGameT2L3', 'nameL4', 'possessionPeriodT1L4', 'possessionGameT1L4', 'gfPeriodT1L4',
            'gfGameT1L4', 'gaPeriodT1L4', 'gaGameT1L4', 'TOCPeriodT1L4', 'TOCGameT1L4', 'xGfPeriodT1L4', 'xGfGameT1L4',
            'xGaPeriodT1L4', 'xGaGameT1L4', 'possessionPeriodT2L4', 'possessionGameT2L4', 'gfPeriodT2L4', 'gfGameT2L4',
            'gaPeriodT2L4', 'gaGameT2L4', 'TOCPeriodT2L4', 'TOCGameT2L4', 'xGfPeriodT2L4', 'xGfGameT2L4', 'xGaPeriodT2L4',
            'xGaGameT2L4', 'nameL5', 'possessionPeriodT1L5', 'possessionGameT1L5', 'gfPeriodT1L5', 'gfGameT1L5', 'gaPeriodT1L5',
            'gaGameT1L5', 'TOCPeriodT1L5', 'TOCGameT1L5', 'xGfPeriodT1L5', 'xGfGameT1L5', 'xGaPeriodT1L5', 'xGaGameT1L5',
            'possessionPeriodT2L5', 'possessionGameT2L5', 'gfPeriodT2L5', 'gfGameT2L5', 'gaPeriodT2L5', 'gaGameT2L5',
            'TOCPeriodT2L5', 'TOCGameT2L5', 'xGfPeriodT2L5', 'xGfGameT2L5', 'xGaPeriodT2L5', 'xGaGameT2L5', 'nameL6',
            'possessionPeriodT1L6', 'possessionGameT1L6', 'gfPeriodT1L6', 'gfGameT1L6', 'gaPeriodT1L6', 'gaGameT1L6',
            'TOCPeriodT1L6', 'TOCGameT1L6', 'xGfPeriodT1L6', 'xGfGameT1L6', 'xGaPeriodT1L6', 'xGaGameT1L6', 'possessionPeriodT2L6',
            'possessionGameT2L6', 'gfPeriodT2L6', 'gfGameT2L6', 'gaPeriodT2L6', 'gaGameT2L6', 'TOCPeriodT2L6', 'TOCGameT2L6',
            'xGfPeriodT2L6', 'xGfGameT2L6', 'xGaPeriodT2L6', 'xGaGameT2L6', 'nameL7', 'possessionPeriodT1L7', 'possessionGameT1L7',
            'gfPeriodT1L7', 'gfGameT1L7', 'gaPeriodT1L7', 'gaGameT1L7', 'TOCPeriodT1L7', 'TOCGameT1L7', 'xGfPeriodT1L7',
            'xGfGameT1L7', 'xGaPeriodT1L7', 'xGaGameT1L7', 'possessionPeriodT2L7', 'possessionGameT2L7', 'gfPeriodT2L7',
            'gfGameT2L7', 'gaPeriodT2L7', 'gaGameT2L7', 'TOCPeriodT2L7', 'TOCGameT2L7', 'xGfPeriodT2L7', 'xGfGameT2L7',
            'xGaPeriodT2L7', 'xGaGameT2L7'

            ]
