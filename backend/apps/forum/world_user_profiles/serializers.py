from django.conf import settings
from drf_spectacular.utils import extend_schema_serializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.forum.worlds.models import Worlds
from apps.forum.world_roles.models import WorldRoles
from apps.forum.world_user_has_roles.models import WorldUserHasRoles

User = get_user_model()

class WorldUserProfilesSerializer(serializers.ModelSerializer):
    world = serializers.IntegerField(write_only=True, required=True)
    user = serializers.IntegerField(write_only=True, required=False)
    deleted_at = serializers.DateTimeField(read_only=True, required=False, allow_null=True)

    class Meta:
        model = WorldUserProfiles
        fields = '__all__'

    def validate(self, attrs):
        name = attrs.get('name', '').strip()
        if not name:
            raise serializers.ValidationError({'name': 'Name is required and cannot be blank.'})
        if len(name) > 64:
            raise serializers.ValidationError({'name': 'Name must be at most 64 characters.'})
        attrs['name'] = name

        description = attrs.get('description', '')
        if description is None:
            description = ''
        description = description.strip()
        if len(description) > 512:
            raise serializers.ValidationError({'description': 'Description must be at most 512 characters.'})
        attrs['description'] = description

        return attrs

    def create(self, validated_data):
        world_id = validated_data.pop('world', None)
        user_id = validated_data.pop('user', None)

        request = self.context.get('request')
        user = None
        if user_id is not None:
            user = User.objects.filter(pk=user_id).first()
        elif request and hasattr(request, 'user') and request.user and not request.user.is_anonymous:
            user = request.user

        if world_id is None:
            raise serializers.ValidationError({'world': 'World is required to create a profile.'})
        world = Worlds.objects.filter(pk=world_id).first()
        if world is None:
            raise serializers.ValidationError({'world': 'World with this id does not exist.'})

        if user is None:
            raise serializers.ValidationError({'user': 'User is required to create a profile.'})

        profile = WorldUserProfiles.objects.create(world=world, user=user, **validated_data)

        default_role = WorldRoles.objects.filter(
            world=world, name="default", is_system=True, deleted_at__isnull=True
        ).first()
        if default_role:
            already_assigned = WorldUserHasRoles.objects.filter(
                world=world, user=user, role=default_role, deleted_at__isnull=True
            ).exists()
            if not already_assigned:
                WorldUserHasRoles.objects.create(world=world, user=user, role=default_role)

        return profile


# Ony for drf documentation purposes
@extend_schema_serializer(exclude_fields=("world", "user"))
class WorldUserProfilesUpdateSerializer(WorldUserProfilesSerializer):
    class Meta(WorldUserProfilesSerializer.Meta):
        pass


class WorldUserProfilePublicSerializer(serializers.ModelSerializer):
    """Read-only serializer exposing user_id for world member listings."""
    user_id = serializers.IntegerField(read_only=True)
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
        fields = ['id', 'name', 'description', 'avatar', 'user_id']
