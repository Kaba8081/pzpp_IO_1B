from rest_framework import serializers
from django.core.exceptions import ValidationError

from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles

class WorldRoomMessagesSerializer(serializers.ModelSerializer):
    room = serializers.IntegerField(read_only=True, source='room_id')
    user = serializers.IntegerField(read_only=True, source='user_id')

    class Meta:
        model = WorldRoomMessages
        fields = '__all__'

    def validate(self, data):

        content = data.get('content')
        user_profile_id = data.get('user_profile')
        room_id = data.get('room')

        if not content:
            raise ValidationError("Content is required.")

        if len(content) > 2048:
            raise ValidationError("Content cannot exceed 2048 characters.")

        if not user_profile_id:
            raise ValidationError("User profile is required.")

        if not room_id:
            raise ValidationError("Room is required.")


        try:
            user_profile = WorldUserProfiles.objects.get(id=user_profile_id)
        except WorldUserProfiles.DoesNotExist:
            raise ValidationError("Invalid user profile.")


        try:
            room = WorldRooms.objects.get(id=room_id)
        except WorldRooms.DoesNotExist:
            raise ValidationError("Invalid room.")


        return data

    def create(self, validated_data):
        
        return WorldRoomMessages.objects.create(**validated_data)
