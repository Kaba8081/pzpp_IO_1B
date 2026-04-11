from django.db import models
from common.models import BaseModel
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles


class WorldRoomMessages(BaseModel):
    id = models.BigAutoField(primary_key=True)
    user_profile = models.ForeignKey(WorldUserProfiles, on_delete=models.DO_NOTHING)
    room = models.ForeignKey(WorldRooms, on_delete=models.DO_NOTHING)
    content = models.CharField(max_length=2048)

    def __str__(self) -> str:
        return str(self.id)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Room Message"
        verbose_name_plural = "Room Messages"
