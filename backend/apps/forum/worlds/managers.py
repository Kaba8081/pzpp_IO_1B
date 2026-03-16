from django.db import models

from apps.forum.worlds.querysets import WorldQuerySet


class WorldManager(models.Manager):
    def get_queryset(self) -> WorldQuerySet:
        return WorldQuerySet(self.model, using=self._db).available()

    def get(self, *args, **kwargs):
        queryset = self.get_queryset()

        if args or kwargs:
            return queryset.get(*args, **kwargs)

        return queryset
