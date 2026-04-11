from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds
from apps.users.models import User
from apps.forum.world_roles.models import WorldRoles

class WorldUserHasRoles(BaseModel):
    world = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    role = models.ForeignKey(WorldRoles, on_delete=models.DO_NOTHING)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"
