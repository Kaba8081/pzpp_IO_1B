from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction

from apps.forum.world_room_messages.models import WorldRoomMessages, WorldRoomSystemMessage, MessageType
from apps.forum.world_room_messages.serializers import WorldRoomMessagesSerializer
from apps.forum.world_room_messages.models.system_message import SystemEventType
from apps.forum.world_rooms.models import WorldRooms


def send_world_system_message(
    world_id: int,
    event_type: SystemEventType,
    profile=None,
) -> WorldRoomMessages | None:
    if profile is not None:
        from apps.forum.world_user_profiles.models import WorldUserProfiles

        if event_type == SystemEventType.USER_JOINED:
            # Skip if user already has other active profiles in this world.
            if WorldUserProfiles.objects.filter(world_id=world_id, user=profile.user).exclude(pk=profile.pk).exists():
                return None

        elif event_type == SystemEventType.USER_LEFT:
            # Skip if user still has other active profiles in this world.
            # Manager already excludes deleted profiles, and this profile is already soft-deleted.
            if WorldUserProfiles.objects.filter(world_id=world_id, user=profile.user).exists():
                return None

    room = WorldRooms.objects.filter(world_id=world_id, deleted_at__isnull=True).order_by('id').first()
    if not room:
        return None

    def _broadcast_world_event():
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        payload = WorldRoomMessagesSerializer(message).data
        async_to_sync(channel_layer.group_send)(
            f'world_{world_id}',
            {
                'type': 'world.system.message',
                'event': 'world.system.message',
                'world_id': world_id,
                'message': payload,
            },
        )

    with transaction.atomic():
        message = WorldRoomMessages.objects.create(
            room=room,
            user_profile=profile,
            content=None,
            message_type=MessageType.SYSTEM,
        )
        WorldRoomSystemMessage.objects.create(message=message, event_type=event_type, user_profile=profile)
        # Both on_commit callbacks (this one + broadcast_message_created signal's _send)
        # run after the atomic block exits, when WorldRoomSystemMessage already exists.
        transaction.on_commit(_broadcast_world_event)

    return message
