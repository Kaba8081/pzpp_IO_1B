from django.db import models
from common.models import BaseModel

class WorldRolePermissions(BaseModel):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(unique=True, null=False, max_length=64)

    def __str__(self) -> str:
        return str(self.name)

    class Meta(BaseModel.Meta):
        abstract = False
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
