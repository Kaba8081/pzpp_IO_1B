from django.db import models

from common.models import BaseModel
from apps.users.models import User


class DirectMessageReadStatus(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dm_read_statuses')
    thread = models.ForeignKey('DirectMessageThread', on_delete=models.CASCADE, related_name='read_statuses')
    last_read_message_id = models.BigIntegerField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        unique_together = [('user', 'thread')]

    def __str__(self) -> str:
        return f'ReadStatus user={self.user.id} thread={self.thread.id} last={self.last_read_message_id}'


class DirectMessageThread(BaseModel):
    id = models.BigAutoField(primary_key=True)
    user_a = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='dm_threads_as_a')
    user_b = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='dm_threads_as_b')

    class Meta(BaseModel.Meta):
        unique_together = [('user_a', 'user_b')]

    def save(self, *args, **kwargs):
        # Enforce canonical ordering so (A,B) and (B,A) map to the same row
        if self.user_a.id and self.user_b.id and self.user_a.id > self.user_b.id:
            self.user_a.id, self.user_b.id = self.user_b.id, self.user_a.id
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'DM Thread {self.id}: {self.user_a.id} <-> {self.user_b.id}'


class DirectMessages(BaseModel):
    id = models.BigAutoField(primary_key=True)
    thread = models.ForeignKey(DirectMessageThread, on_delete=models.DO_NOTHING, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='sent_dms')
    content = models.CharField(max_length=2048, null=True, blank=True)

    class Meta(BaseModel.Meta):
        ordering = ['created_at']

    def __str__(self) -> str:
        return f'DM {self.id} in thread {self.thread.id} from {self.sender.id}'
