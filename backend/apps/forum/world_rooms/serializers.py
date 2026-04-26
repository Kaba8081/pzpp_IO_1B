from drf_spectacular.utils import extend_schema_serializer
from rest_framework import serializers

from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_room_messages.models import WorldRoomMessages, WorldRoomReadStatus

class WorldRoomsSerializer(serializers.ModelSerializer):
    world_id = serializers.IntegerField(read_only=True)
    has_unread = serializers.SerializerMethodField()

    def get_has_unread(self, obj) -> bool:
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        
        latest = (
            WorldRoomMessages.objects
            .filter(room=obj, deleted_at__isnull=True)
            .order_by('-id')
            .values_list('id', flat=True)
            .first()
        )
        if not latest:
            return False
        try:
            status = WorldRoomReadStatus.objects.get(user=request.user, room=obj)
            return (status.last_read_message_id or 0) < latest
        except WorldRoomReadStatus.DoesNotExist:
            return False

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

        if not self.partial:
            world_object = attrs.get('world')
            if world_object is None:
                raise serializers.ValidationError({'world': 'World is required.'})
        return attrs

    def create(self, validated_data):
        world_object = validated_data.get('world')
        if world_object is None:
            raise serializers.ValidationError({'world': 'World is required to create a room.'})

        name = validated_data.get('name')
        if WorldRooms.objects.filter(world=world_object, name__iexact=name).exists():
            raise serializers.ValidationError(
                {'name': 'A room with this name already exists in this world.'}
            )

        return WorldRooms.objects.create(**validated_data)


# Only for drf documentation purposes
@extend_schema_serializer(exclude_fields=("world",))
class WorldRoomsUpdateSerializer(WorldRoomsSerializer):
    class Meta(WorldRoomsSerializer.Meta):
        pass
