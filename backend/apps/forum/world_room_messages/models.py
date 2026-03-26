from django.db import models
from common.models import BaseModel
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles


class WorldRoomMessages(BaseModel):
    id = models.BigAutoField(primary_key=True)
    user_profile_id = models.ForeignKey(WorldUserProfiles, on_delete=models.DO_NOTHING)
    room_id = models.ForeignKey(WorldRooms, on_delete=models.DO_NOTHING)
    content = models.CharField(max_length=2048)
