from django.db import models

class WorldRoomMessagesQuerySet(models.QuerySet):
    def available(self) -> 'WorldRoomMessagesQuerySet':
        return self.filter(deleted_at__isnull=True)