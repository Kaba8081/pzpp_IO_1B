from rest_framework import serializers

from apps.forum.world_rooms.models import WorldRooms
from apps.forum.worlds.models import Worlds

class WorldRoomsSerializer(serializers.ModelSerializer):
    world_id = serializers.IntegerField(read_only=True, source='world_id')
    

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

        world_id = attrs.get('world_id')
        world_object = None
        if world_id is not None:
            try:
                world_object = Worlds.objects.get(pk=world_id)
            except Worlds.DoesNotExist:
                raise serializers.ValidationError({'world_id': 'World with given id does not exist.'})
        
        attrs['world_object'] = world_object
        return attrs

    def create(self, validated_data):
        world_object = validated_data.pop('world_object', None)
        if world_object is None:
            raise serializers.ValidationError({'world': 'World is required to create a room.'})
       
        name = validated_data.get('name')
        if WorldRooms.objects.filter(world=world_object, name__iexact=name).exists():
            raise serializers.ValidationError({'name': 'A room with this name already exists in this world.'})

        return WorldRooms.objects.create(world=world_object, **validated_data)

    