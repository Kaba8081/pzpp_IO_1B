from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds
from apps.forum.world_rooms.managers import WorldRoomManager


class WorldRooms(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=256)
    thumbnail = models.ImageField(upload_to="world_room_thumbnails", null=True, blank=True)

    def __str__(self) -> str:
        return str(self.name)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "World Room"
        verbose_name_plural = "World Rooms"

    objects = WorldRoomManager()
    all_objects = models.Manager()
