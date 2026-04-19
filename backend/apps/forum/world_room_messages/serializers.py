from rest_framework import serializers
from django.core.exceptions import ValidationError

from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles

class WorldRoomMessagesSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=WorldRooms.objects.all())
    user_profile = serializers.PrimaryKeyRelatedField(queryset=WorldUserProfiles.objects.all())

    class Meta:
        model = WorldRoomMessages
        fields = '__all__'

    def validate(self, attrs):
        user_profile_id = attrs.get('user_profile')
        room_id = attrs.get('room')

        if user_profile_id:
            try:
                WorldUserProfiles.objects.get(id=user_profile_id)
            except WorldUserProfiles.DoesNotExist as exc:
                raise ValidationError("Invalid user profile.") from exc

        if room_id:
            try:
                WorldRooms.objects.get(id=room_id)
            except WorldRooms.DoesNotExist as exc:
                raise ValidationError("Invalid room.") from exc

        return attrs

    def create(self, validated_data):
        return WorldRoomMessages.objects.create(**validated_data)
