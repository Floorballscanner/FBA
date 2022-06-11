
from rest_framework import serializers
from .models import Live

class LiveSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Live
        fields = 'data'
