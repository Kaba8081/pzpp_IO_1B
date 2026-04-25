from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.forum.world_room_messages.models import WorldRoomMessages


@receiver(post_save, sender=WorldRoomMessages)
def broadcast_message_created(sender, instance, created, **kwargs):
    if not created:
        return

    from apps.forum.world_room_messages.serializers import WorldRoomMessagesSerializer

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    payload = WorldRoomMessagesSerializer(instance).data
    room_group_name = f'world_room_{instance.room_id}'

    transaction.on_commit(
        lambda: async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'room.message.created',
                'event': 'room.message.created',
                'room_id': instance.room_id,
                'message': payload,
            },
        )
    )
