from django.conf import settings
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from drf_spectacular.utils import extend_schema_field

from .models import UserProfile

User = get_user_model()


def _build_media_url(media_field) -> str | None:
    if not media_field:
        return None

    url = media_field.url
    site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    if not site_url:
        return url
    if not url.startswith('/'):
        url = f'/{url}'
    return f'{site_url}{url}'

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.IntegerField(read_only=True, source='user_id')
    profile_picture = serializers.SerializerMethodField()

    def get_profile_picture(self, obj) -> str | None:
        return _build_media_url(obj.profile_picture)

    class Meta:
        model = UserProfile
        fields = ['user', 'username', 'description', 'profile_picture']

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'profile']

    @extend_schema_field(UserProfileSerializer)
    def get_profile(self, obj):
        profile = UserProfile.objects.filter(user=obj).first()
        return UserProfileSerializer(profile).data if profile else None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    username = serializers.CharField(
        max_length=64,
        validators=[UniqueValidator(queryset=UserProfile.objects.all())]
    )
    description = serializers.CharField(max_length=255, required=False)

    class Meta:
        model = User
        fields = ['email', 'password', 'username', 'description']

    def create(self, validated_data):
        '''This also creates the UserProfile for the registered user'''
        username = validated_data.pop('username')
        description = validated_data.pop('description', '')

        try:
            with transaction.atomic():
                user = User.objects.create_user(**validated_data)
                UserProfile.objects.create(
                    user=user,
                    username=username,
                    description=description
                )
                return user
        except Exception as e:
            raise serializers.ValidationError({
                "detail": f"An error occurred while creating your account: {e}"
            })

        return user
