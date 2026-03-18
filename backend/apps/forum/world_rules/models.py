from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds

class WorldRules(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world_id = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    stat_slug = models.CharField
    type = models.CharField
    is_required = models.BooleanField(default=False)