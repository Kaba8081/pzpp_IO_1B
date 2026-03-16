from django.db import models


class WorldQuerySet(models.QuerySet):
    def available(self) -> 'WorldQuerySet':
        return self.filter(deleted_at__isnull=True)
