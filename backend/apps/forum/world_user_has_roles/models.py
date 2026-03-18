from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds
from apps.users.models import User
from apps.forum.world_roles.models import WorldRoles

class WorldUserHasRoles(BaseModel):
    world_id = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    user_id = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    role_id = models.ForeignKey(WorldRoles, on_delete=models.DO_NOTHING)

