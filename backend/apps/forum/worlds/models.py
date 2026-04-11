from django.db import models

from common.models import BaseModel
from apps.forum.worlds.managers import WorldManager

class Worlds(BaseModel):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="worlds")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="world_avatars", null=True, blank=True)

    objects = WorldManager()
    all_objects = models.Manager()

    def __str__(self) -> str:
        return str(self.name)
