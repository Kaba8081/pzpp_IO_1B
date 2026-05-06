from django.db import models
from apps.forum.world_roles.querysets import WorldRolesQuerySet

class WorldRolesManager(models.Manager):
    def get_queryset(self):
        return WorldRolesQuerySet(self.model, using=self._db).available()
