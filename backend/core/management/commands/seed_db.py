import os
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Run all available seeders.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of objects to create per seeder (default: 20)'
        )

        parser.add_argument(
            '--img_count',
            type=int,
            default=20,
            help='Number of images to download per model that supports it'
        )

    def handle(self, *args, **options):

        base_apps_dir = Path(__file__).resolve().parent.parent.parent.parent / 'apps'
        seeder_prefix = 'seed_'
        seeder_commands = []

        # Iterate through each app directory
        for app_dir in base_apps_dir.iterdir():
            if not app_dir.is_dir():
                continue

            commands_dir = app_dir / 'management' / 'commands'
            if not commands_dir.exists():
                continue

            for filename in os.listdir(commands_dir):
                if (filename.startswith(seeder_prefix)
                    and filename.endswith('.py')
                    and filename != '__init__.py'):
                    command_name = filename[:-3]
                    seeder_commands.append(command_name)

        if not seeder_commands:
            self.stdout.write(self.style.WARNING('No seeder commands found.'))
            return

        count = options.get('count', 20)
        img_count = options.get('img_count', 20)
        for command in seeder_commands:
            if command in ["seed_users", "seed_worlds"]:
                call_command(command, count=count, img_count=img_count)
            else:
                call_command(command, count=count)

        self.stdout.write(self.style.SUCCESS('All seeders executed.'))
