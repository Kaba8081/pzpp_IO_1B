from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds


class WorldRooms(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world_id = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=256)
