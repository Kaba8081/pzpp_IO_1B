# type: ignore[reportPrivateImportUsage]
import factory
from factory import fuzzy
from factory.django import DjangoModelFactory, ImageField
from factory.declarations import LazyFunction
from faker import Faker

from apps.users.factories import UserFactory
from apps.forum.models import (
    Worlds,
    WorldUserProfiles,
    WorldRooms,
    WorldRoomMessages
)

fake = Faker()

def custom_username():
    return f"{fake.user_name()}{fuzzy.FuzzyInteger(1000, 9999).fuzz()}"

class WorldFactory(DjangoModelFactory):
    class Meta:
        model = Worlds

    owner = factory.SubFactory(UserFactory)
    name = factory.Faker('street_name')
    description = factory.Faker('text', max_nb_chars=300)
    profile_picture=ImageField(color='blue', width=200, height=200, filename='profile.jpg')

class WorldUserProfileFactory(DjangoModelFactory):
    class Meta:
        model = WorldUserProfiles

    world = factory.SubFactory(WorldFactory)
    user = factory.SubFactory(UserFactory)
    name = LazyFunction(custom_username)
    description = factory.Faker('sentence', nb_words=6)

class WorldRoomFactory(DjangoModelFactory):
    class Meta:
        model = WorldRooms

    world = factory.SubFactory(WorldFactory)
    name = factory.Faker('city')
    description = factory.Faker('sentence', nb_words=15)

class WorldRoomMessageFactory(DjangoModelFactory):
    class Meta:
        model = WorldRoomMessages

    user_profile = factory.SubFactory(WorldUserProfileFactory)
    room = factory.SubFactory(WorldRoomFactory)
    content = factory.Faker('text', max_nb_chars=256)
