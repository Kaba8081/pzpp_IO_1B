from factory.django import DjangoModelFactory, ImageField
from factory.faker import Faker
from factory.declarations import SubFactory

from apps.users.factories import UserFactory
from apps.forum.models import (
    Worlds,
    WorldUserProfiles,
    WorldRooms,
    WorldRoomMessages
)

class WorldFactory(DjangoModelFactory):
    class Meta: # type: ignore
        model = Worlds

    owner = SubFactory(UserFactory)
    name = Faker('city')
    description = Faker('text', max_nb_chars=300)
    profile_picture=ImageField(color='blue', width=200, height=200, filename='profile.jpg')

class WorldUserProfileFactory(DjangoModelFactory):
    class Meta: # type: ignore
        model = WorldUserProfiles

    world = SubFactory(WorldFactory)
    user = SubFactory(UserFactory)
    name = Faker('user_name')
    description = Faker('sentence', nb_words=6)

class WorldRoomFactory(DjangoModelFactory):
    class Meta: # type: ignore
        model = WorldRooms

    world = SubFactory(WorldFactory)
    name = Faker('words', nb=3)
    description = Faker('sentence', nb_words=15)

class WorldRoomMessageFactory(DjangoModelFactory):
    class Meta:  # type: ignore
        model = WorldRoomMessages

    user_profile = SubFactory(WorldUserProfileFactory)
    room = SubFactory(WorldRoomFactory)
    content = Faker('text', max_nb_chars=256)
