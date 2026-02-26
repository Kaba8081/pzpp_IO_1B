from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from django.conf import settings

class Command(BaseCommand):
    def handle(self, *args, **options) -> None:
        if User.objects.count() == 0:
            for user in settings.ADMINS:
                print(f"Creating superuser account for {user['username']} ({user['email']})")
                new_admin = User.objects.create_superuser(
                    email=user['email'],
                    username=user['username'],
                    password=user['password']
                )
                new_admin.save()

        else:
            print('Admin accounts can only be initialized if no Accounts exist')
