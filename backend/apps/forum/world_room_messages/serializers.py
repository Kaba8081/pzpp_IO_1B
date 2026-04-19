from rest_framework import serializers

from apps.forum.world_room_messages.models import WorldRoomMessages

class WorldRoomMessagesSerializer(serializers.ModelSerializer):
    room = serializers.IntegerField(read_only=True, source='room_id')
    user = serializers.IntegerField(read_only=True, source='user_id')

    class Meta:
        model = WorldRoomMessages
        fields = '__all__'
