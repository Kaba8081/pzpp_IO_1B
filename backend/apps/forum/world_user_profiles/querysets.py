from django.db import models


class WorldUserProfilesQuerySet(models.QuerySet):
    def available(self) -> 'WorldUserProfilesQuerySet':
        return self.filter(deleted_at__isnull=True)
