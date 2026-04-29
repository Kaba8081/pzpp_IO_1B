from django.db import models
from common.models import BaseModel
from apps.forum.world_room_messages.models.message import WorldRoomMessages


class MediaType(models.TextChoices):
    IMAGE = 'image', 'Image'
    VIDEO = 'video', 'Video'


class WorldRoomMediaMessage(BaseModel):
    message = models.OneToOneField(
        WorldRoomMessages,
        on_delete=models.CASCADE,
        related_name='media_message',
    )
    file = models.FileField(upload_to='room_media/')
    media_type = models.CharField(max_length=8, choices=MediaType.choices)

    def __str__(self) -> str:
        return f'MediaMessage {self.message.id} ({self.media_type})'

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Room Media Message"
        verbose_name_plural = "Room Media Messages"
