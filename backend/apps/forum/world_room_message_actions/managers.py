from django.db import models

from apps.forum.world_room_message_actions.querysets import WorldRoomMessageActionsQuerySet

class WorldRoomMessageActionsManager(models.Manager):
    def get_queryset(self) -> WorldRoomMessageActionsQuerySet:
        return WorldRoomMessageActionsQuerySet(self.model, using=self._db).available()

    def get(self, *args, **kwargs):
        queryset = self.get_queryset()

        if args or kwargs:
            return queryset.get(*args, **kwargs)

        return queryset