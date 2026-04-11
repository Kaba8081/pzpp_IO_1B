# pylint: disable=W0718:broad-exception-caught
import random

from django.db import transaction
from django.core.management import call_command

from common.management import BaseSeeder
from apps.forum.factories import WorldRoomMessageFactory
from apps.forum.models import (
    WorldUserProfiles,
    WorldRooms
)

class Command(BaseSeeder):
    help = "Seeds the local db with initial world room message data"

    def prepare(self, *args, **kwargs) -> None:
        user_profile_count = WorldUserProfiles.objects.count()
        world_room_count = WorldRooms.objects.count()

                # Ensure enough users exist in the database
        if user_profile_count < self.config.object_count:
            self.stdout.write("[PREPARE] Not enough users, seeding . . .")
            call_command('seed_users', count=self.config.object_count - user_profile_count)

        # Ensure enough worlds exist in the database
        if world_room_count < self.config.object_count:
            self.stdout.write("[PREPARE] Not enough world rooms, seeding . . .")
            call_command('seed_world_rooms', count=self.config.object_count - world_room_count)

        super().prepare(self, *args, **kwargs)

    @transaction.atomic
    def seed(self, *args, **kwargs) -> None:
        self.stdout.write("[SEED] Seeding world room messages data . . . ", ending="")

        try:
            user_profile = list(WorldUserProfiles.objects.all())
            room = list(WorldRooms.objects.all())

            # pick object_count amount of user-worlds pairs
            n = min(self.config.object_count, len(user_profile), len(room))
            random.shuffle(user_profile)
            random.shuffle(room)
            pairs = zip(user_profile, room)

            for user_profile, room in list(pairs)[:n]:
                WorldRoomMessageFactory(user_profile=user_profile, room=room)
        except Exception as e:
            self.stdout.write(self.style.ERROR("FAIL"))
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
        else:
            self.stdout.write(self.style.SUCCESS("SUCCESS"))
