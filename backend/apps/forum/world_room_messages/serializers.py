from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import serializers

from apps.forum.world_room_messages.models import (
    WorldRoomMessages,
    WorldRoomMediaMessage,
    WorldRoomSystemMessage,
    MessageType,
)
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.users.models import UserProfile


def serialize_avatar(obj, request) -> str | None:
    if not obj.avatar:
        return None
    url = obj.avatar.url
    if request is not None:
        return request.build_absolute_uri(url)
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    if not site_url:
        return url
    if not url.startswith('/'):
        url = f'/{url}'
    return f'{site_url}{url}'


def get_account_username(user) -> str:
    profile: UserProfile | None = user.userprofile_set.first()
    return profile.username if profile else user.email


class WorldUserProfileAuthorSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(read_only=True)
    name = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    profile_name = serializers.CharField(source='name', read_only=True)

    def get_avatar(self, obj) -> str | None:
        request = self.context.get('request')
        return serialize_avatar(obj, request)

    def get_name(self, obj) -> str:
        return obj.name

    def get_username(self, obj) -> str:
        return get_account_username(obj.user)

    class Meta:
        model = WorldUserProfiles
        fields = ['id', 'name', 'username', 'profile_name', 'avatar', 'user_id']


class WorldRoomMediaMessageSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    def get_file(self, obj) -> str | None:
        if not obj.file:
            return None
        url = obj.file.url
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
        model = WorldRoomMediaMessage
        fields = ['id', 'file', 'media_type']


class WorldRoomSystemMessageSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    def get_user_profile(self, obj):
        profile = obj.user_profile
        if profile is None:
            return None
        return {
            'id': profile.id,
            'name': get_account_username(profile.user),
            'username': get_account_username(profile.user),
            'profile_name': profile.name,
            'avatar': serialize_avatar(profile, self.context.get('request')),
            'user_id': profile.user_id,
        }

    class Meta:
        model = WorldRoomSystemMessage
        fields = ['id', 'event_type', 'user_profile']


class WorldRoomMessagesSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=WorldRooms.objects.all())
    user_profile = serializers.PrimaryKeyRelatedField(
        queryset=WorldUserProfiles.objects.all(), allow_null=True, required=False
    )
    author = serializers.SerializerMethodField()
    media_message = WorldRoomMediaMessageSerializer(read_only=True)
    system_message = WorldRoomSystemMessageSerializer(read_only=True)

    class Meta:
        model = WorldRoomMessages
        fields = '__all__'

    def get_author(self, obj):
        profile = obj.user_profile
        if profile is None:
            system_message = getattr(obj, 'system_message', None)
            profile = getattr(system_message, 'user_profile', None)
        if profile is None:
            return None
        return {
            'id': profile.id,
            'name': profile.name,
            'username': get_account_username(profile.user),
            'profile_name': profile.name,
            'avatar': serialize_avatar(profile, self.context.get('request')),
            'user_id': profile.user_id,
        }

    def validate(self, attrs):
        user_profile = attrs.get('user_profile')
        room = attrs.get('room')
        message_type = attrs.get('message_type', MessageType.TEXT)

        if message_type != MessageType.SYSTEM and not user_profile:
            raise ValidationError({'user_profile': 'User profile is required for non-system messages.'})

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
