# type: ignore[reportPrivateImportUsage]
import factory
from factory.declarations import LazyFunction
from factory.django import DjangoModelFactory, ImageField
from factory import fuzzy
from faker import Faker

from apps.users.models import User, UserProfile

fake = Faker()

def custom_email():
    return f"{fake.user_name()}{fuzzy.FuzzyInteger(1000, 9999).fuzz()}@example.com"

def custom_username():
    return f"{fake.user_name()}{fuzzy.FuzzyInteger(1000, 9999).fuzz()}"

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = LazyFunction(custom_email)

class UserProfileFactory(DjangoModelFactory):
    class Meta:
        model = UserProfile

    user = factory.SubFactory(UserFactory)
    username = LazyFunction(custom_username)
    description = factory.Faker('sentence', nb_words=6)
    profile_picture = ImageField(color='blue', width=200, height=200, filename='profile.jpg')
