from django.db import models
from backend.apps.forum.world_user_profiles.managers import WorldUserProfilesManager
from common.models import BaseModel
from apps.forum.worlds.models import Worlds
from apps.users.models import User

class WorldUserProfiles(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=512)

    objects = WorldUserProfilesManager()
    all_objects = models.Manager()

    def __str__(self) -> str:
        return str(self.name)
