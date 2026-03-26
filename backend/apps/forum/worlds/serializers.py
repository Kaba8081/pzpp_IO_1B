from rest_framework import serializers

from apps.forum.worlds.models import Worlds

class WorldSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(read_only=True, source='owner_id_id')

    class Meta:
        model = Worlds
        fields = [
            'id', 
            'name', 
            'description', 
            'owner_id',
            'profile_picture',
        ]
