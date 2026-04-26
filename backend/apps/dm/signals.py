from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.dm.models import DirectMessages


@receiver(post_save, sender=DirectMessages)
def broadcast_dm_created(sender, instance, created, **kwargs):
    if not created:
        return

    from apps.dm.serializers import DirectMessageSerializer

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    payload = DirectMessageSerializer(instance).data
    thread_group_name = f'dm_thread_{instance.thread_id}'

    transaction.on_commit(
        lambda: async_to_sync(channel_layer.group_send)(
            thread_group_name,
            {
                'type': 'dm.message.created',
                'event': 'dm.message.created',
                'thread_id': instance.thread_id,
                'message': payload,
            },
        )
    )
