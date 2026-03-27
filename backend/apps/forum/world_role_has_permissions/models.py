from django.db import models
from common.models import BaseModel
from apps.forum.world_roles.models import WorldRoles
from apps.forum.world_role_permissions.models import WorldRolePermissions

class WorldRoleHasPermissions(BaseModel):
    role = models.ForeignKey(WorldRoles, on_delete=models.DO_NOTHING)
    permission = models.ForeignKey(WorldRolePermissions, on_delete=models.DO_NOTHING)
