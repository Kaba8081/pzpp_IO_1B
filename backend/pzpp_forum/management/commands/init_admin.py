from django.core.management.base import BaseCommand
from django.conf import settings

from apps.users.models import User

class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        if User.objects.count() == 0:
            for user in settings.ADMINS:
                print(f"Creating superuser account for {user['username']} ({user['email']})")
                new_admin = User.objects.create_superuser( # type: ignore
                    email=user['email'],
                    password=user['password']
                )
                new_admin.save()

        else:
            print('Admin accounts can only be initialized if no Accounts exist')
