from typing import TYPE_CHECKING

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandParser
from django.conf import settings

if TYPE_CHECKING:
    from psycopg2._psycopg import cursor

class Command(BaseCommand):
    help = 'Recreates the PostreSQL database from scratch also running the init commands'

    def add_arguments(
        self,
        parser: CommandParser
    ) -> None:
        parser.add_argument(
            '--password',
            type=str,
            help='The password for the Postgres user',
        )

    def handle(self, *args, **kwargs) -> None:
        db_config = settings.DATABASES['default']

        # Use the argument if provided, otherwise fallback to settings
        password = kwargs['password'] or db_config.get('PASSWORD')

        try:
            con = psycopg2.connect(
                dbname = 'postgres',
                user = 'postgres',
                password = password,
                host = db_config.get('HOST', 'localhost'),
                port = db_config.get('PORT', '5432')
            )
            con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = con.cursor()

            self._drop_db(cursor, db_config['NAME'])
            self._drop_user(cursor, db_config['USER'])

            cursor.close()
            con.close()
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error dropping database: {e}"))
            return

        call_command('init_db', password=password)
        call_command('makemigrations')
        call_command('migrate')
        call_command('init_admin')

    @staticmethod
    def _db_exists(
        cursor: "cursor",
        db_name: str
    ) -> bool:
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", [db_name])
        exists = cursor.fetchone()

        return bool(exists)

    @staticmethod
    def _user_exists(
        cursor: "cursor",
        user: str,
    ) -> bool:
        cursor.execute("SELECT 1 FROM pg_catalog.pg_user WHERE usename = %s", [user])
        exists = cursor.fetchone()
        return bool(exists)

    def _drop_db(
        self,
        cursor: "cursor",
        db_name: str
    ) -> None:
        self.stdout.write(f"Dropping database '{db_name}'...")

        if not self._db_exists(cursor, db_name):
                return self.stdout.write(
                self.style.NOTICE(f"Database {db_name} does not exist. Skipping ...")
                )

        cursor.execute(f'DROP DATABASE "{db_name}"')
        self.stdout.write(self.style.SUCCESS(f"Database '{db_name}' dropped successfully"))

        return

    def _drop_user(
        self,
        cursor: "cursor",
        user: str,
    ) -> None:
        self.stdout.write(f"Dropping user '{user}'...")

        if not self._user_exists(cursor, user):
            return self.stdout.write(
                self.style.NOTICE(f"User '{user}' doesn't exist. Skipping ...")
            )

        cursor.execute(f'DROP USER "{user}"')
        self.stdout.write(self.style.SUCCESS(f"User '{user}' dropped successfully"))

        return
