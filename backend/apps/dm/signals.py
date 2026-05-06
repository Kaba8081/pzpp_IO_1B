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

    from apps.dm.models import DirectMessageReadStatus
    from apps.dm.serializers import DirectMessageSerializer

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    thread = instance.thread
    thread_group_name = f'dm_thread_{instance.thread_id}'

    # Advance sender's read status so their UI doesn't show a dot.
    DirectMessageReadStatus.objects.update_or_create(
        user_id=instance.sender_id,
        thread=thread,
        defaults={'last_read_message_id': instance.id},
    )

    # Determine recipient (the other participant).
    recipient_id = thread.user_b_id if thread.user_a_id == instance.sender_id else thread.user_a_id

    def _send():
        # Refresh instance from DB with media message relation prefetched
        # so the serializer has access to media data created in same transaction.
        from django.db.models import prefetch_related_objects
        prefetch_related_objects([instance], 'media_message')
        
        payload = DirectMessageSerializer(instance).data
        
        # Broadcast to the DM room channel (for live message display).
        async_to_sync(channel_layer.group_send)(
            thread_group_name,
            {
                'type': 'dm.message.created',
                'event': 'dm.message.created',
                'thread_id': instance.thread_id,
                'message': payload,
            },
        )
        # Notify the recipient's user events channel about the new unread message.
        async_to_sync(channel_layer.group_send)(
            f'user_{recipient_id}',
            {
                'type': 'unread.updated',
                'event': 'unread.updated',
                'kind': 'dm',
                'id': instance.thread_id,
                'unread': True,
            },
        )

    transaction.on_commit(_send)
