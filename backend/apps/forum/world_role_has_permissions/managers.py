from django.db import models
from apps.forum.world_role_has_permissions.querysets import WorldRoleHasPermissionsQuerySet

class WorldRoleHasPermissionsManager(models.Manager):
    def get_queryset(self):
        return WorldRoleHasPermissionsQuerySet(self.model, using=self._db).available()
