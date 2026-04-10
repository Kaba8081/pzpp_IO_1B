from django.db import models

class WorldRoomQuerySet(models.QuerySet):
    def available(self) -> 'WorldRoomQuerySet':
        return self.filter(deleted_at__isnull=True)