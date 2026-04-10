from django.db import models

from apps.forum.world_rooms.querysets import WorldRoomQuerySet

class WorldRoomManager(models.Manager):
    def get_queryset(self) -> WorldRoomQuerySet:
        return WorldRoomQuerySet(self.model, using=self._db).available()

    def get(self, *args, **kwargs):
        queryset = self.get_queryset()

        if args or kwargs:
            return queryset.get(*args, **kwargs)

        return queryset