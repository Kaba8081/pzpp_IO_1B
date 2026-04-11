from factory.django import DjangoModelFactory, ImageField
from factory.faker import Faker
from factory.declarations import SubFactory

from apps.users.models import User, UserProfile

class UserFactory(DjangoModelFactory):
    class Meta:  # type: ignore
        model = User

    email = Faker('email')

class UserProfileFactory(DjangoModelFactory):
    class Meta:  # type: ignore
        model = UserProfile

    user = SubFactory(UserFactory)
    username = Faker('user_name')
    description = Faker('sentence', nb_words=6)
    profile_picture = ImageField(color='blue', width=200, height=200, filename='profile.jpg')
