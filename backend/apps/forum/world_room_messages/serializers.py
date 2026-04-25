from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import serializers

from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles


class WorldUserProfileAuthorSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    def get_avatar(self, obj) -> str | None:
        if not obj.avatar:
            return None
        url = obj.avatar.url
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
        if not site_url:
            return url
        if not url.startswith('/'):
            url = f'/{url}'
        return f'{site_url}{url}'

    class Meta:
        model = WorldUserProfiles
        fields = ['id', 'name', 'avatar']


class WorldRoomMessagesSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=WorldRooms.objects.all())
    user_profile = serializers.PrimaryKeyRelatedField(queryset=WorldUserProfiles.objects.all())
    author = WorldUserProfileAuthorSerializer(source='user_profile', read_only=True)

    class Meta:
        model = WorldRoomMessages
        fields = '__all__'

    def validate(self, attrs):
        user_profile = attrs.get('user_profile')
        room = attrs.get('room')

        if user_profile and not WorldUserProfiles.objects.filter(pk=user_profile.pk).exists():
            raise ValidationError({'user_profile': 'Invalid user profile.'})

        if room and not WorldRooms.objects.filter(pk=room.pk).exists():
            raise ValidationError({'room': 'Invalid room.'})

        return attrs

    def create(self, validated_data):
        user_profile = validated_data.get('user_profile')
        room = validated_data.get('room')

        if user_profile and room:
            if user_profile.world_id != room.world_id:
                raise ValidationError(
                    {'user_profile': 'The user profile must belong to the same world as the room.'}
                )

        return WorldRoomMessages.objects.create(**validated_data)

    def update(self, instance, validated_data):
        new_user_profile = validated_data.get('user_profile', instance.user_profile)
        new_room = validated_data.get('room', instance.room)

        if new_user_profile != instance.user_profile:
            raise ValidationError(
                {'user_profile': 'Cannot change the user profile that sent the message.'}
            )

        if new_room != instance.room:
            raise ValidationError(
                {'room': 'Cannot change the room where the message was sent.'}
            )

        return super().update(instance, validated_data)
