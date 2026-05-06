from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.forum.world_user_profiles.serializers import WorldUserProfilePublicSerializer
from apps.forum.world_room_messages.services import send_world_system_message
from apps.forum.world_room_messages.models.system_message import SystemEventType

@receiver(post_save, sender=WorldUserProfiles)
def broadcast_profile_created(sender, instance: WorldUserProfiles, created, **kwargs):
    if not created:
        return

    send_world_system_message(instance.world.id, SystemEventType.USER_JOINED, profile=instance)

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    payload = WorldUserProfilePublicSerializer(instance).data
    world_group_name = f'world_{instance.world.id}'

    transaction.on_commit(
        lambda: async_to_sync(channel_layer.group_send)(
            world_group_name,
            {
                'type': 'world.profile.created',
                'event': 'world.profile.created',
                'world_id': instance.world.id,
                'profile': payload,
            },
        )
    )
