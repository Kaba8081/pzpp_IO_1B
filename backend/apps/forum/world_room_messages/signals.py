from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_room_messages.models import WorldRoomReadStatus
from apps.forum.world_room_messages.serializers import WorldRoomMessagesSerializer
from apps.forum.world_user_profiles.models import WorldUserProfiles

@receiver(post_save, sender=WorldRoomMessages)
def broadcast_message_created(sender, instance, created, **kwargs):
    if not created:
        return

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    room_group_name = f'world_room_{instance.room_id}'
    world_id = instance.room.world_id
    sender_user_id = instance.user_profile.user_id if instance.user_profile_id else None

    if sender_user_id:
        # Advance sender's read status so their UI doesn't show a dot.
        WorldRoomReadStatus.objects.update_or_create(
            user_id=sender_user_id,
            room_id=instance.room_id,
            defaults={'last_read_message_id': instance.id},
        )

    # Collect all distinct world members except the sender.
    recipient_ids = list(
        WorldUserProfiles.objects
        .filter(world_id=world_id, deleted_at__isnull=True)
        .exclude(user_id=sender_user_id)
        .values_list('user_id', flat=True)
        .distinct()
    ) if sender_user_id else list(
        WorldUserProfiles.objects
        .filter(world_id=world_id, deleted_at__isnull=True)
        .values_list('user_id', flat=True)
        .distinct()
    )

    def _send():
        # Refresh instance from DB with media/system message relations prefetched
        # so the serializer has access to subtypes (media/system) created in same transaction.
        from django.db.models import prefetch_related_objects
        prefetch_related_objects([instance], 'media_message', 'system_message', 'system_message__user_profile')
        
        payload = WorldRoomMessagesSerializer(instance).data

        # Broadcast to the room channel (for live message display).
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'room.message.created',
                'event': 'room.message.created',
                'room_id': instance.room_id,
                'message': payload,
            },
        )
        # Notify each world member about the unread message.
        for uid in recipient_ids:
            async_to_sync(channel_layer.group_send)(
                f'user_{uid}',
                {
                    'type': 'unread.updated',
                    'event': 'unread.updated',
                    'kind': 'room',
                    'id': instance.room_id,
                    'unread': True,
                },
            )

    transaction.on_commit(_send)
