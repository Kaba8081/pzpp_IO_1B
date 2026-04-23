from django.db import models

class WorldRoomMessageActionsQuerySet(models.QuerySet):
    def available(self) -> 'WorldRoomMessageActionsQuerySet':
        return self.filter(deleted_at__isnull=True)
