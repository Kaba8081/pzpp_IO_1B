from django.db import models
from common.models import BaseModel
from apps.dm.models import DirectMessages


class DirectMessageMediaMessage(BaseModel):
    """Media attachment for DirectMessages"""
    message = models.OneToOneField(
        DirectMessages,
        on_delete=models.CASCADE,
        related_name='media_message',
    )
    file = models.FileField(upload_to='dm_media/')
    media_type = models.CharField(
        max_length=8,
        choices=[('image', 'Image'), ('video', 'Video')]
    )

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "DM Media Message"
        verbose_name_plural = "DM Media Messages"

    def __str__(self) -> str:
        return f'DMMediaMessage {self.message.id} ({self.media_type})'
