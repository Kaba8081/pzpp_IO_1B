from rest_framework import serializers

from apps.forum.worlds.models import World

class WorldSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(max_length=1024, required=False, allow_blank=True)
    owner_id = serializers.IntegerField(read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = World
        fields = [
            'id', 
            'name', 
            'description', 
            'owner_id',
        ]
