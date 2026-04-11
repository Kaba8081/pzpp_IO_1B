# pylint: disable=W0718:broad-exception-caught
from pathlib import Path

from django.conf import settings
from django.db import transaction

from common.management import BaseSeeder, SeederConfig
from apps.users.factories import UserFactory, UserProfileFactory

class Command(BaseSeeder):
    help = "Seeds the local db with initial user data"
    config = SeederConfig(
        prepare_images=True,
        img_count=20,
        img_folder=Path(settings.MEDIA_ROOT) / "avatars"
    )

    @transaction.atomic
    def seed(self, *args, **kwargs) -> None:
        self.stdout.write("[SEED] Seeding user data . . . ", ending="")

        try:
            users = UserFactory.create_batch(self.config.object_count)
            for user in users:
                avatar = self.get_random_image(self.config.img_folder)
                UserProfileFactory(
                    user=user,
                    profile_picture=str(avatar) if avatar else None
                )
        except Exception as e:
            self.stdout.write(self.style.ERROR("FAIL"))
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
        else:
            self.stdout.write(self.style.SUCCESS("SUCCESS"))
