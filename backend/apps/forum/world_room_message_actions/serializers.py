from rest_framework import serializers

from apps.forum.world_room_message_actions.models import WorldRoomMessageActions

class WorldRoomMessageActionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldRoomMessageActions
        fields = '__all__'


