from rest_framework import serializers

from apps.forum.world_rooms.models import WorldRooms
from apps.forum.worlds.models import Worlds

class WorldRoomsSerializer(serializers.ModelSerializer):
    world = serializers.IntegerField(read_only=True, source='world_id')
    world_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = WorldRooms
        fields = '__all__'

    def validate(self, attrs):
        name = attrs.get('name', '')
        if not isinstance(name, str) or not name.strip():
            raise serializers.ValidationError({'name': 'Name is required and cannot be blank.'})

        name = name.strip()
        if len(name) > 64:
            raise serializers.ValidationError({'name': 'Name must be at most 64 characters.'})
        attrs['name'] = name

        description = attrs.get('description', '')
        if description is None:
            description = ''
        if not isinstance(description, str):
            raise serializers.ValidationError({'description': 'Description must be a string.'})

        description = description.strip()
        if len(description) > 256:
            raise serializers.ValidationError({'description': 'Description must be at most 256 characters.'})
        attrs['description'] = description

        world_id = attrs.get('world_id')
        if world_id is not None:
            if not Worlds.objects.filter(pk=world_id).exists():
                raise serializers.ValidationError({'world_id': 'World with given id does not exist.'})

        return attrs

    def create(self, validated_data):
        world = validated_data.pop('world_id', None) or validated_data.pop('world', None)
        if world is None:
            raise serializers.ValidationError({'world': 'World is required to create a room.'})

        if isinstance(world, int):
            try:
                world = Worlds.objects.get(pk=world)
            except Worlds.DoesNotExist:
                raise serializers.ValidationError({'world': 'World with given id does not exist.'})
        elif isinstance(world, str) and world.isdigit():
            try:
                world = Worlds.objects.get(pk=int(world))
            except Worlds.DoesNotExist:
                raise serializers.ValidationError({'world': 'World with given id does not exist.'})
        elif not isinstance(world, Worlds):
            raise serializers.ValidationError({'world': 'World must be a valid world instance or id.'})

        name = validated_data.get('name')
        if WorldRooms.objects.filter(world=world, name__iexact=name).exists():
            raise serializers.ValidationError({'name': 'A room with this name already exists in this world.'})

        return WorldRooms.objects.create(world=world, **validated_data)

    