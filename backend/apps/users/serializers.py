from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from drf_spectacular.utils import extend_schema_field

from .models import UserProfile

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['username', 'description', 'profilePicture']

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'profile']

    @extend_schema_field(UserProfileSerializer)
    def get_profile(self, obj):
        profile = UserProfile.objects.filter(userId=obj).first()
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
                    userId=user,
                    username=username,
                    description=description
                )
                return user
        except Exception as e:
            raise serializers.ValidationError({
                "detail": f"An error occurred while creating your account: {e}"
            })

        return user
