from django.db import models

from common.models import BaseModel
from apps.users.models import User


class DirectMessageThread(BaseModel):
    id = models.BigAutoField(primary_key=True)
    user_a = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='dm_threads_as_a')
    user_b = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='dm_threads_as_b')

    class Meta:
        unique_together = [('user_a', 'user_b')]

    def save(self, *args, **kwargs):
        # Enforce canonical ordering so (A,B) and (B,A) map to the same row
        if self.user_a_id and self.user_b_id and self.user_a_id > self.user_b_id:
            self.user_a_id, self.user_b_id = self.user_b_id, self.user_a_id
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'DM Thread {self.id}: {self.user_a_id} <-> {self.user_b_id}'


class DirectMessages(BaseModel):
    id = models.BigAutoField(primary_key=True)
    thread = models.ForeignKey(DirectMessageThread, on_delete=models.DO_NOTHING, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='sent_dms')
    content = models.CharField(max_length=2048)

    class Meta:
        ordering = ['created_at']

    def __str__(self) -> str:
        return f'DM {self.id} in thread {self.thread_id} from {self.sender_id}'
