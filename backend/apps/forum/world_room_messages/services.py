from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.core.files.uploadedfile import UploadedFile

from apps.forum.world_room_messages.models import WorldRoomMessages, WorldRoomSystemMessage, MessageType, WorldRoomMediaMessage
from apps.forum.world_room_messages.serializers import WorldRoomMessagesSerializer
from apps.forum.world_room_messages.models.system_message import SystemEventType
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles


def send_world_system_message(
    world_id: int,
    event_type: SystemEventType,
    profile=None,
) -> WorldRoomMessages | None:
    if profile is not None:
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


def create_media_message(
    room: WorldRooms,
    user_profile,
    file: UploadedFile,
    media_type: str,
) -> WorldRoomMessages:
    """
    Create a media message with file upload.
    
    Args:
        room: The WorldRooms instance where the message will be posted
        user_profile: The WorldUserProfiles instance of the sender
        file: The uploaded file (UploadedFile)
        media_type: Type of media - 'image' or 'video'
    
    Returns:
        Created WorldRoomMessages instance with media_message relation
    """
    if media_type not in ['image', 'video']:
        raise ValueError(f"Invalid media_type: {media_type}. Must be 'image' or 'video'")
    
    with transaction.atomic():
        # Create the text message (without content)
        message = WorldRoomMessages.objects.create(
            room=room,
            user_profile=user_profile,
            content=None,
            message_type=MessageType.MEDIA,
        )
        
        # Create the media message attachment
        WorldRoomMediaMessage.objects.create(
            message=message,
            file=file,
            media_type=media_type,
        )
    
    # Refresh to include media_message relation
    message.refresh_from_db()
    return message
