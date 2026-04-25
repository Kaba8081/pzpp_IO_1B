# pylint: disable=W0718:broad-exception-caught
from pathlib import Path
import random

from django.conf import settings
from django.db import transaction
from django.core.management import call_command

from common.management import BaseSeeder, SeederConfig
from apps.forum.models import Worlds
from apps.forum.factories import WorldRoomFactory

class Command(BaseSeeder):
    help = "Seed the local db with initial world room data"
    config = SeederConfig(
        prepare_images=True,
        img_count=20,
        img_folder=Path(settings.MEDIA_ROOT) / "world_room_thumbnails"
    )

    def prepare(self, *args, **kwargs) -> None:
        world_count = Worlds.objects.count()

        # Ensure enough worlds exist in the database
        if world_count < self.config.object_count:
            self.stdout.write("[PREPARE] Not enough worlds, seeding . . .")
            call_command('seed_worlds', count=self.config.object_count - world_count)

        super().prepare(self, *args, **kwargs)

    @transaction.atomic
    def seed(self, *args, **kwargs) -> None:
        self.stdout.write("[SEED] Seeding world room data . . . ", ending="")

        try:
            user_ids = list(Worlds.objects.values_list('id', flat=True))
            for _ in range(self.config.object_count):
                world = Worlds.objects.get(id=random.choice(user_ids))
                avatar = self.get_random_image(self.config.img_folder)
                WorldRoomFactory(
                    world=world,
                    thumbnail=self.to_media_relative_path(avatar)
                )
        except Exception as e:
            self.stdout.write(self.style.ERROR("FAIL"))
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
        else:
            self.stdout.write(self.style.SUCCESS("SUCCESS"))
