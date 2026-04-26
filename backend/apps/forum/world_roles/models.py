from django.db import models
from common.models import BaseModel
from apps.forum.worlds.models import Worlds

class WorldRoles(BaseModel):
    id = models.BigAutoField(primary_key=True)
    world = models.ForeignKey(Worlds, on_delete=models.DO_NOTHING)
    name = models.CharField(null=False, max_length=64)
    is_system = models.BooleanField(default=False)

    def __str__(self) -> str:
        return str(self.name)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "World Role"
        verbose_name_plural = "World Roles"
