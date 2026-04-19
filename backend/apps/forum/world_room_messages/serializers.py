from rest_framework import serializers

from apps.forum.world_room_messages.models import WorldRoomMessages

class WorldRoomMessagesSerializer(serializers.ModelSerializer):
    room = serializers.IntegerField()
    user_profile = serializers.IntegerField()

    class Meta:
        model = WorldRoomMessages
        fields = '__all__'
