from rest_framework import serializers

from apps.forum.world_room_message_actions.models import WorldRoomMessageActions

class WorldRoomMessageActionsSerializer(serializers.ModelSerializer):
    message = serializers.IntegerField(read_only=True, source='message_id')
    world_rule = serializers.IntegerField(read_only=True, source='world_rule_id')
    user_profile = serializers.IntegerField(read_only=True, source='user_profile_id')

    class Meta:
        model = WorldRoomMessageActions
        fields = '__all__'


