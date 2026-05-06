from django.db import models

class WorldRolesQuerySet(models.QuerySet):
    def available(self):
        return self.filter(deleted_at__isnull=True)
