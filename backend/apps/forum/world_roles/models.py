from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds

class WorldRoles(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    name = models.CharField(null=False, max_length=64)
