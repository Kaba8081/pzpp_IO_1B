from django.db import models

from  apps.forum.world_user_profiles.querysets import WorldUserProfilesQuerySet

class WorldManager(models.Manager):
    def get_queryset(self) -> WorldUserProfilesQuerySet:
        return WorldUserProfilesQuerySet(self.model, using=self._db).available()

    def get(self, *args, **kwargs):
        queryset = self.get_queryset()

        if args or kwargs:
            return queryset.get(*args, **kwargs)

        return queryset
