from django.db import models

from apps.forum.world_room_messages.querysets import WorldRoomMessagesQuerySet


class WorldRoomMessagesManager(models.Manager):
    def get_queryset(self) -> WorldRoomMessagesQuerySet:
        return WorldRoomMessagesQuerySet(self.model, using=self._db).available()

    def get(self, *args, **kwargs):
        queryset = self.get_queryset()

        if args or kwargs:
            return queryset.get(*args, **kwargs)

        return queryset
