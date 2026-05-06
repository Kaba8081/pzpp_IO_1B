from django.db import models
from common.models import BaseModel
from apps.forum.world_roles.models import WorldRoles
from apps.forum.world_role_has_permissions.managers import WorldRoleHasPermissionsManager
from apps.forum.world_role_permissions.models import WorldRolePermissions

class WorldRoleHasPermissions(BaseModel):
    role = models.ForeignKey(WorldRoles, on_delete=models.DO_NOTHING)
    permission = models.ForeignKey(WorldRolePermissions, on_delete=models.DO_NOTHING)

    objects = WorldRoleHasPermissionsManager()
    all_objects = models.Manager()

    def __str__(self) -> str:
        return str(f"{self.role.name} - {self.permission.name}")

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"
