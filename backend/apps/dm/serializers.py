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


class DirectMessageSerializer(serializers.ModelSerializer):
    sender_info = serializers.SerializerMethodField()

    def get_sender_info(self, obj) -> dict:
        return _user_to_dict(obj.sender, self.context.get('request'))

    class Meta:
        model = DirectMessages
        fields = ['id', 'thread', 'sender', 'content', 'sender_info', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender_info']


class DirectMessageThreadSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

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

    class Meta:
        model = DirectMessageThread
        fields = ['id', 'user_a', 'user_b', 'other_user', 'last_message', 'created_at']
        read_only_fields = ['id', 'created_at', 'other_user', 'last_message']
