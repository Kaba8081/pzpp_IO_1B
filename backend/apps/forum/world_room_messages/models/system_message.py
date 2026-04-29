from django.db import models
from common.models import BaseModel
from apps.forum.world_room_messages.models.message import WorldRoomMessages


class SystemEventType(models.TextChoices):
    USER_JOINED = 'user_joined', 'User Joined'
    USER_LEFT = 'user_left', 'User Left'


class WorldRoomSystemMessage(BaseModel):
    message = models.OneToOneField(
        WorldRoomMessages,
        on_delete=models.CASCADE,
        related_name='system_message',
    )
    event_type = models.CharField(max_length=32, choices=SystemEventType.choices)
    user_profile = models.ForeignKey(
        'forum.WorldUserProfiles',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='system_messages',
    )

    def __str__(self) -> str:
        return f'SystemMessage {self.message.id} ({self.event_type})'

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Room System Message"
        verbose_name_plural = "Room System Messages"
