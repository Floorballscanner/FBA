
from rest_framework_json_api import serializers
from .models import Live

class LiveSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Live
        fields = ('data')