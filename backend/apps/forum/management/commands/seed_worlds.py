# pylint: disable=W0718:broad-exception-caught
from pathlib import Path
import random

from django.conf import settings
from django.db import transaction
from django.core.management import call_command

from common.management import BaseSeeder, SeederConfig
from apps.users.models import User
from apps.forum.factories import WorldFactory

class Command(BaseSeeder):
    help = "Seeds the local db with inital world data"
    config = SeederConfig(
        prepare_images=True,
        img_count=20,
        img_folder=Path(settings.MEDIA_ROOT) / "world_avatars"
    )

    def prepare(self, *args, **kwargs) -> None:
        user_count = User.objects.count()

        # Ensure enough users exist in the database
        if user_count < self.config.object_count:
            self.stdout.write("[PREPARE] Not enough users, seeding . . .")
            call_command('seed_users', count=self.config.object_count - user_count)

        super().prepare(self, *args, **kwargs)

    @transaction.atomic
    def seed(self, *args, **kwargs) -> None:
        self.stdout.write("[SEED] Seeding world data . . . ", ending="")

        try:
            user_ids = list(User.objects.values_list('id', flat=True))
            for _ in range(self.config.object_count):
                owner = User.objects.get(id=random.choice(user_ids))
                avatar = self.get_random_image(self.config.img_folder)
                WorldFactory(
                    owner=owner,
                    profile_picture=self.to_media_relative_path(avatar)
                )
        except Exception as e:
            self.stdout.write(self.style.ERROR("FAIL"))
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
        else:
            self.stdout.write(self.style.SUCCESS("SUCCESS"))
