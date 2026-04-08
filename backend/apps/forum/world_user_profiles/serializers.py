from drf_spectacular.utils import extend_schema_serializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.forum.worlds.models import Worlds

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

        return WorldUserProfiles.objects.create(world=world, user=user, **validated_data)


# Ony for drf documentation purposes
@extend_schema_serializer(exclude_fields=("world", "user"))
class WorldUserProfilesUpdateSerializer(WorldUserProfilesSerializer):
    class Meta(WorldUserProfilesSerializer.Meta):
        pass