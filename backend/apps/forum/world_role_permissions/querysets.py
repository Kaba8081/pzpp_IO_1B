from django.db import models

class WorldRolePermissionsQuerySet(models.QuerySet):
    def available(self):
        return self.filter(deleted_at__isnull=True)
