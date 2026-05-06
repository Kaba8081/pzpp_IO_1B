# pylint: disable=W0718:broad-exception-caught
from pathlib import Path
import random

from django.conf import settings
from django.db import transaction
from django.core.management import call_command

from common.management import BaseSeeder, SeederConfig
from apps.users.models import User
from apps.forum.models import Worlds
from apps.forum.factories import WorldUserProfileFactory

class Command(BaseSeeder):
    help = "Seeds the local db with initial user world profile data"
    config = SeederConfig(
        prepare_images=True,
        img_count=20,
        img_folder=Path(settings.MEDIA_ROOT) / "world_profile_avatars"
    )

    def prepare(self, *args, **kwargs) -> None:
        user_count = User.objects.count()
        world_count = Worlds.objects.count()
        target_count = max(1, self.config.object_count // 4)

                # Ensure enough users exist in the database
        if user_count < target_count:
            self.stdout.write("[PREPARE] Not enough users, seeding . . .")
            call_command('seed_users', count=self.config.object_count - user_count)

        # Ensure enough worlds exist in the database
        if world_count < target_count:
            self.stdout.write("[PREPARE] Not enough worlds, seeding . . .")
            call_command('seed_worlds', count=target_count - world_count)

        super().prepare(self, *args, **kwargs)

    @transaction.atomic
    def seed(self, *args, **kwargs) -> None:
        self.stdout.write("[SEED] Seeding world user profile data . . . ", ending="")

        try:
            users = list(User.objects.all())
            worlds = list(Worlds.objects.all())

            # pick object_count amount of user-worlds pairs
            n = min(self.config.object_count, len(users), len(worlds))
            random.shuffle(users)
            random.shuffle(worlds)
            pairs = zip(users, worlds)

            for user, world in list(pairs)[:n]:
                avatar = self.get_random_image(self.config.img_folder)
                WorldUserProfileFactory(
                    user=user, 
                    world=world,
                    avatar=self.to_media_relative_path(avatar)
                )
        except Exception as e:
            self.stdout.write(self.style.ERROR("FAIL"))
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
        else:
            self.stdout.write(self.style.SUCCESS("SUCCESS"))
