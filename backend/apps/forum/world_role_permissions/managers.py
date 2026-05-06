from django.db import models
from apps.forum.world_role_permissions.querysets import WorldRolePermissionsQuerySet

class WorldRolePermissionsManager(models.Manager):
    def get_queryset(self):
        return WorldRolePermissionsQuerySet(self.model, using=self._db).available()
