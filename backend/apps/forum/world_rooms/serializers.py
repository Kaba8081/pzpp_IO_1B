from rest_framework import serializers

from apps.forum.world_rooms.models import WorldRooms

class WorldRoomsSerializer(serializers.ModelSerializer):
    world_id = serializers.IntegerField(read_only=True, source='world_id_id')

    class Meta:
        model = WorldRooms
        fields = '__all__'