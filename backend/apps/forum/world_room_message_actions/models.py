from django.db import models
from common.models import BaseModel
from apps.forum.world_room_messages.models import   WorldRoomMessages
from apps.forum.world_rules.models import WorldRules
from apps.forum.world_user_profiles.models import WorldUserProfiles


class WorldRoomMessageActions(BaseModel):
    id = models.BigAutoField(primary_key=True)
    message = models.ForeignKey(WorldRoomMessages, on_delete=models.DO_NOTHING)
    world_rule = models.ForeignKey(WorldRules, on_delete=models.DO_NOTHING)
    user_profile = models.ForeignKey(WorldUserProfiles, on_delete=models.DO_NOTHING)
    value = models.CharField(max_length=256)

    def __str__(self) -> str:
        return str(self.id)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Message Action"
        verbose_name_plural = "Message Actions"
