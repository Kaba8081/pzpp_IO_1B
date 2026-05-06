from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Runs init_db, migrate, and init_admin in a single Django process.'

    def handle(self, *args, **options) -> None:
        self.stdout.write('Running init_db...')
        call_command('init_db')

        self.stdout.write('Running migrate...')
        call_command('migrate', '--run-syncdb', verbosity=1)

        self.stdout.write('Running init_admin...')
        call_command('init_admin')

        self.stdout.write(self.style.SUCCESS('Bootstrap complete.'))
