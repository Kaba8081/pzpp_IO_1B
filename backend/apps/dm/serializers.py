from django.conf import settings
from rest_framework import serializers

from apps.dm.models import DirectMessageThread, DirectMessages
from apps.users.models import UserProfile


def _build_avatar_url(avatar_field, request=None) -> str | None:
    if not avatar_field:
        return None
    url = avatar_field.url
    if request is not None:
        return request.build_absolute_uri(url)
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    if not site_url:
        return url
    if not url.startswith('/'):
        url = f'/{url}'
    return f'{site_url}{url}'


def _user_to_dict(user, request=None) -> dict:
    profile: UserProfile | None = user.userprofile_set.first()
    return {
        'id': user.id,
        'username': profile.username if profile else user.email,
        'avatar': _build_avatar_url(profile.profile_picture, request) if profile else None,
    }


class DirectMessageMediaMessageSerializer(serializers.Serializer):
    """Serializer for media attachments in DM"""
    id = serializers.IntegerField(read_only=True)
    file = serializers.SerializerMethodField()
    media_type = serializers.CharField()

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


class DirectMessageSerializer(serializers.ModelSerializer):
    sender_info = serializers.SerializerMethodField()
    media_message = serializers.SerializerMethodField()

    def get_sender_info(self, obj) -> dict:
        return _user_to_dict(obj.sender, self.context.get('request'))

    def get_media_message(self, obj):
        if not hasattr(obj, 'media_message'):
            return None
        serializer = DirectMessageMediaMessageSerializer(
            obj.media_message,
            context=self.context
        )
        return serializer.data

    class Meta:
        model = DirectMessages
        fields = ['id', 'thread', 'sender', 'content', 'sender_info', 'media_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender_info', 'media_message']


class DirectMessageThreadSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    has_unread = serializers.SerializerMethodField()

    def get_other_user(self, obj) -> dict | None:
        request = self.context.get('request')
        if not request:
            return None
        other = obj.user_b if obj.user_a_id == request.user.id else obj.user_a
        return _user_to_dict(other, request)

    def get_last_message(self, obj) -> dict | None:
        msg = obj.messages.order_by('-created_at').first()
        if not msg:
            return None
        return {
            'id': msg.id,
            'content': msg.content,
            'sender_id': msg.sender_id,
            'created_at': msg.created_at,
        }

    def get_has_unread(self, obj) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        from apps.dm.models import DirectMessageReadStatus
        latest = obj.messages.order_by('-id').values_list('id', flat=True).first()
        if not latest:
            return False
        try:
            status = DirectMessageReadStatus.objects.get(user=request.user, thread=obj)
            return (status.last_read_message_id or 0) < latest
        except DirectMessageReadStatus.DoesNotExist:
            return True

    class Meta:
        model = DirectMessageThread
        fields = ['id', 'user_a', 'user_b', 'other_user', 'last_message', 'has_unread', 'created_at']
        read_only_fields = ['id', 'created_at', 'other_user', 'last_message', 'has_unread']
