import os
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Run all available seeders.'

    def handle(self, *args, **options):

        base_apps_dir = Path(__file__).resolve().parent.parent.parent.parent / 'apps'
        seeder_prefix = 'seed_'
        seeder_commands = []

        # Iterate through each app directory
        for app_dir in base_apps_dir.iterdir():
            if app_dir.is_dir():
                commands_dir = app_dir / 'management' / 'commands'
                if commands_dir.exists():
                    for filename in os.listdir(commands_dir):
                        if filename.startswith(seeder_prefix) and filename.endswith('.py') and filename != '__init__.py':
                            command_name = filename[:-3]  # Remove .py
                            seeder_commands.append(command_name)

        if not seeder_commands:
            self.stdout.write(self.style.WARNING('No seeder commands found.'))
            return

        for command in seeder_commands:
            call_command(command)

        self.stdout.write(self.style.SUCCESS('All seeders executed.'))
