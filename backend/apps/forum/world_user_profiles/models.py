from django.db import models

from common.models import BaseModel
from apps.forum.worlds.models import Worlds
from apps.users.models import User
from apps.forum.world_user_profiles.managers import WorldUserProfilesManager

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

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
