from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.forum.worlds.models import Worlds

User = get_user_model()

class WorldUserProfilesSerializer(serializers.ModelSerializer):
    world = serializers.IntegerField(read_only=True, source='world_id')
    user = serializers.IntegerField(read_only=True, source='user_id')

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
        world = validated_data.pop('world', None) or validated_data.pop('world_id', None)
        user = validated_data.pop('user', None) or validated_data.pop('user_id', None)

        request = self.context.get('request')
        if user is None and request and hasattr(request, 'user') and request.user and not request.user.is_anonymous:
            user = request.user

        if world is None:
            raise serializers.ValidationError({'world': 'World is required to create a profile.'})
        if user is None:
            raise serializers.ValidationError({'user': 'User is required to create a profile.'})

        if isinstance(world, int):
            world = Worlds.objects.filter(pk=world).first()
            if world is None:
                raise serializers.ValidationError({'world': 'World with this id does not exist.'})

        if isinstance(user, int):
            user = User.objects.filter(pk=user).first()
            if user is None:
                raise serializers.ValidationError({'user': 'User with this id does not exist.'})

        if WorldUserProfiles.objects.filter(world=world, user=user).exists():
            raise serializers.ValidationError({'detail': 'A profile already exists for this user in this world.'})

        return WorldUserProfiles.objects.create(world=world, user=user, **validated_data)

