from django.db import models
from common.models import BaseModel
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.users.models import User


class WorldRoomReadStatus(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_read_statuses')
    room = models.ForeignKey(WorldRooms, on_delete=models.CASCADE, related_name='read_statuses')
    last_read_message_id = models.BigIntegerField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        unique_together = [('user', 'room')]

    def __str__(self) -> str:
        return f'ReadStatus user={self.user.id} room={self.room.id} last={self.last_read_message_id}'


class WorldRoomMessages(BaseModel):
    id = models.BigAutoField(primary_key=True)
    user_profile = models.ForeignKey(WorldUserProfiles, on_delete=models.DO_NOTHING)
    room = models.ForeignKey(WorldRooms, on_delete=models.DO_NOTHING)
    content = models.TextField(max_length=1024)

    def __str__(self) -> str:
        return str(self.id)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Room Message"
        verbose_name_plural = "Room Messages"
