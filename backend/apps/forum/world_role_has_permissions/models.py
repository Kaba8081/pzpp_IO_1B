from django.db import models
from common.models import BaseModel
from apps.forum.world_roles.models import WorldRoles
from apps.forum.world_role_permissions.models import WorldRolePermissions

class WorldRoleHasPermissions(BaseModel):
    role_id = models.ForeignKey(WorldRoles, on_delete=models.DO_NOTHING)
    permission_id = models.ForeignKey(WorldRolePermissions, on_delete=models.DO_NOTHING)