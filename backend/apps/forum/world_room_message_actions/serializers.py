from rest_framework import serializers

from apps.forum.world_room_message_actions.models import WorldRoomMessageActions
from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_rules.models import WorldRules
from apps.forum.world_user_profiles.models import WorldUserProfiles


class WorldRoomMessageActionsSerializer(serializers.ModelSerializer):
    message = serializers.IntegerField(read_only=True, source='message_id')
    world_rule = serializers.IntegerField(read_only=True, source='world_rule_id')
    user_profile = serializers.IntegerField(read_only=True, source='user_profile_id')

    class Meta:
        model = WorldRoomMessageActions
        fields = '__all__'

    def validate(self, attrs):
        
        value = attrs.get('value')
        if value:
            if not value.strip():
                raise serializers.ValidationError(
                    {"value": "Value cannot be empty."}
                )
            if len(value) > 256:
                raise serializers.ValidationError(
                    {"value": "Value cannot exceed 256 characters."}
                )
            attrs['value'] = value.strip()

        
        message_id = attrs.get('message_id')
        world_rule_id = attrs.get('world_rule_id')
        user_profile_id = attrs.get('user_profile_id')

        if message_id and not WorldRoomMessages.objects.filter(id=message_id).exists():
            raise serializers.ValidationError(
                {"message": f"WorldRoomMessage with id {message_id} does not exist."}
            )

        if world_rule_id and not WorldRules.objects.filter(id=world_rule_id).exists():
            raise serializers.ValidationError(
                {"world_rule": f"WorldRule with id {world_rule_id} does not exist."}
            )

        if user_profile_id and not WorldUserProfiles.objects.filter(id=user_profile_id).exists():
            raise serializers.ValidationError(
                {"user_profile": f"WorldUserProfile with id {user_profile_id} does not exist."}
            )

        return attrs

    def create(self, validated_data):
        
        message_id = validated_data.get('message_id')
        world_rule_id = validated_data.get('world_rule_id')
        user_profile_id = validated_data.get('user_profile_id')

        
        try:
            WorldRoomMessages.objects.get(id=message_id)
        except WorldRoomMessages.DoesNotExist:
            raise serializers.ValidationError(
                {"message": f"WorldRoomMessage with id {message_id} does not exist."}
            )

        try:
            WorldRules.objects.get(id=world_rule_id)
        except WorldRules.DoesNotExist:
            raise serializers.ValidationError(
                {"world_rule": f"WorldRule with id {world_rule_id} does not exist."}
            )

        try:
            WorldUserProfiles.objects.get(id=user_profile_id)
        except WorldUserProfiles.DoesNotExist:
            raise serializers.ValidationError(
                {"user_profile": f"WorldUserProfile with id {user_profile_id} does not exist."}
            )

        return WorldRoomMessageActions.objects.create(**validated_data)


