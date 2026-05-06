# pylint: disable=W0718:broad-exception-caught
import random
from collections import defaultdict

from django.db import transaction
from django.core.management import call_command

from common.management import BaseSeeder
from apps.forum.factories import WorldRoomMessageFactory
from apps.forum.models import (
    WorldRoomMessages,
    WorldUserProfiles,
    WorldRooms
)

class Command(BaseSeeder):
    help = "Seeds the local db with initial world room message data"

    def prepare(self, *args, **kwargs) -> None:
        user_profile_count = WorldUserProfiles.objects.count()
        world_room_count = WorldRooms.objects.count()
        target_count = max(1, self.config.object_count // 4)

                # Ensure enough users exist in the database
        if user_profile_count < target_count:
            self.stdout.write("[PREPARE] Not enough users, seeding . . .")
            call_command('seed_users', count=self.config.object_count - user_profile_count)

        # Ensure enough worlds exist in the database
        if world_room_count > target_count:
            self.stdout.write("[PREPARE] Not enough world rooms, seeding . . .")
            call_command('seed_world_rooms', count=self.config.object_count - world_room_count)

        super().prepare(self, *args, **kwargs)

    @transaction.atomic
    def seed(self, *args, **kwargs) -> None:
        self.stdout.write("[SEED] Seeding world room messages data . . . ", ending="")

        try:
            # Group user profiles by world
            user_profiles_by_world = defaultdict(list)
            for up in WorldUserProfiles.objects.all():
                user_profiles_by_world[up.world.id].append(up)

            # Group rooms by world
            rooms_by_world = defaultdict(list)
            for room in WorldRooms.objects.all():
                rooms_by_world[room.world.id].append(room)

            for world_id, profiles in user_profiles_by_world.items():
                rooms = rooms_by_world.get(world_id, [])
                if not rooms:
                    continue
                n = min(20, len(profiles))
                selected_profiles = random.sample(profiles, n) if len(profiles) > n else profiles
                for user_profile in selected_profiles:
                    room = random.choice(rooms)
                    WorldRoomMessageFactory(user_profile=user_profile, room=room)

            # Ensure each room has at least 100 messages.
            for room in WorldRooms.objects.all():
                profiles = user_profiles_by_world.get(room.world.id, [])
                if not profiles:
                    continue

                n = min(20, len(profiles))
                eligible_profiles = random.sample(profiles, n) if len(profiles) > n else profiles

                existing_count = WorldRoomMessages.objects.filter(room=room).count()
                missing_count = max(0, 100 - existing_count)

                for _ in range(missing_count):
                    user_profile = random.choice(eligible_profiles)
                    WorldRoomMessageFactory(user_profile=user_profile, room=room)
        except Exception as e:
            self.stdout.write(self.style.ERROR("FAIL"))
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
        else:
            self.stdout.write(self.style.SUCCESS("SUCCESS"))
