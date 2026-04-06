from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds

class WorldRules(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    stat_slug = models.CharField(max_length=64)
    type = models.CharField(max_length=64)
    is_required = models.BooleanField(default=False)

    def __str__(self) -> str:
        return str(self.stat_slug)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "World Rule"
        verbose_name_plural = "World Rules"
