from django.db import models
from common.models import BaseModel
from apps.forum.world_role_permissions.managers import WorldRolePermissionsManager

class WorldRolePermissions(BaseModel):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(unique=True, null=False, max_length=64)

    objects = WorldRolePermissionsManager()
    all_objects = models.Manager()

    def __str__(self) -> str:
        return str(self.name)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
