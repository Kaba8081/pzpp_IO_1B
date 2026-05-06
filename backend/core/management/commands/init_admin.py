from django.core.management.base import BaseCommand
import os

from apps.users.models import User

class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        if User.objects.count() == 0:
            username = os.getenv('DJANGO_SUPERUSER_USERNAME')
            email = os.getenv('DJANGO_SUPERUSER_EMAIL')
            password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

            if not username or not email or not password:
                raise ValueError('DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, and DJANGO_SUPERUSER_PASSWORD must be set.')

            print(f"Creating superuser account for {username} ({email})")
            new_admin = User.objects.create_superuser(  # type: ignore
                email=email,
                password=password,
            )
            new_admin.username = username
            new_admin.save()

        else:
            print('Admin accounts can only be initialized if no Accounts exist')
