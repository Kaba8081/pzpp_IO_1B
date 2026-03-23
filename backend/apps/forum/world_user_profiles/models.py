from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds
from apps.users.models import User

class WorldUserProfiles(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world_id = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    user_id = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=512)
