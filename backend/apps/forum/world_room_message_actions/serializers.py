from rest_framework import serializers
from rest_framework.serializers import ValidationError

from apps.forum.world_room_message_actions.models import WorldRoomMessageActions
from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_rules.models import WorldRules
from apps.forum.world_user_profiles.models import WorldUserProfiles


class WorldRoomMessageActionsSerializer(serializers.ModelSerializer):
    message = serializers.PrimaryKeyRelatedField(queryset=WorldRoomMessages.objects.all())
    world_rule = serializers.PrimaryKeyRelatedField(queryset=WorldRules.objects.all())
    user_profile = serializers.PrimaryKeyRelatedField(queryset=WorldUserProfiles.objects.all())

    class Meta:
        model = WorldRoomMessageActions
        fields = '__all__'

    def validate(self, attrs):

        value = attrs.get('value')
        if value:
            value = value.strip()
            if not value:
                raise ValidationError(
                    {"value": "Value cannot be empty."}
                )
            if len(value) > 256:
                raise ValidationError(
                    {"value": "Value cannot exceed 256 characters."}
                )
            attrs['value'] = value

        message = attrs.get('message')
        world_rule = attrs.get('world_rule')
        user_profile = attrs.get('user_profile')

        if message and not WorldRoomMessages.objects.filter(pk=message.pk).exists():
            raise ValidationError(
                {"message": f"WorldRoomMessage with id {message.pk} does not exist."}
            )

        if world_rule and not WorldRules.objects.filter(pk=world_rule.pk).exists():
            raise ValidationError(
                {"world_rule": f"WorldRule with id {world_rule.pk} does not exist."}
            )

        if user_profile and not WorldUserProfiles.objects.filter(pk=user_profile.pk).exists():
            raise ValidationError(
                {"user_profile": f"WorldUserProfile with id {user_profile.pk} does not exist."}
            )

        return attrs

    def create(self, validated_data):
        message = validated_data.get('message')
        world_rule = validated_data.get('world_rule')
        user_profile = validated_data.get('user_profile')

        message_world_id = message.room.world_id
        if world_rule.world_id != message_world_id or user_profile.world_id != message_world_id:
            raise ValidationError(
                {
                    "non_field_errors": (
                        "message, world_rule, and user_profile must belong to the same world."
                    )
                }
            )

        return WorldRoomMessageActions.objects.create(**validated_data)

    def update(self, instance, validated_data):
        new_message = validated_data.get('message', instance.message)
        new_world_rule = validated_data.get('world_rule', instance.world_rule)
        new_user_profile = validated_data.get('user_profile', instance.user_profile)

        if new_message != instance.message:
            raise ValidationError(
                {"message": "Cannot change the message of an existing action."}
            )

        if new_world_rule != instance.world_rule:
            raise ValidationError(
                {"world_rule": "Cannot change the world rule of an existing action."}
            )

        if new_user_profile != instance.user_profile:
            raise ValidationError(
                {"user_profile": "Cannot change the user profile of an existing action."}
            )

        return super().update(instance, validated_data)
