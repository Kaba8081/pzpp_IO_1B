from django.db import models
from common.models import BaseModel

class World(BaseModel):
    id = models.AutoField(primary_key=True)
    owner_id = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="worlds")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    profile_picture = models.ImageField(null=True, blank=True)

    def __str__(self) -> str:
        return self.name
