from typing import TYPE_CHECKING

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from django.core.management.base import BaseCommand, CommandParser
from django.conf import settings

if TYPE_CHECKING:
    from psycopg2._psycopg import cursor

class Command(BaseCommand):
    help = 'Automatically creates the PostgreSQL database defined in settings if it does not exist.'

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

        # Try to create the db and the user
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

            self._create_db(cursor, db_config['NAME'])
            self._create_user(cursor, db_config['USER'], db_config['PASSWORD'])

            cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_config['NAME']} TO {db_config['USER']}")

            cursor.close()
            con.close()

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error creating database: {e}"))

        # Ensure the newly created user has permissions on public schema
        try:
            con = psycopg2.connect(
                dbname=db_config["NAME"],
                user = 'postgres',
                password = password,
                host = db_config.get('HOST', 'localhost'),
                port = db_config.get('PORT', '5432')
            )
            con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = con.cursor()

            cursor.execute(f'GRANT ALL ON SCHEMA public TO "{db_config["USER"]}"')

            cursor.close()
            con.close()

            self.stdout.write(self.style.SUCCESS("Database created and permissions granted!"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error granting permissions on schema public: {e}"))

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

    def _create_db(
        self,
        cursor: "cursor",
        db_name: str
    ) -> None:
        self.stdout.write(f"Checking if database '{db_name}' exists...")

        if self._db_exists(cursor, db_name):
            return self.stdout.write(
                self.style.NOTICE(f"Database '{db_name}' already exists. Skipping.")
            )

        self.stdout.write(self.style.NOTICE(f"User '{db_name}' does not exist. Creating..."))
        cursor.execute(f'CREATE DATABASE "{db_name}"')
        self.stdout.write(self.style.SUCCESS(f"Database '{db_name}' created successfully."))

        return

    def _create_user(
        self,
        cursor: "cursor",
        user: str,
        password: str | None = None
    ) -> None:
        pwd_clause = f"WITH PASSWORD '{password}'" if password else ''
        cmd = f'CREATE USER "{user}" {pwd_clause}'.strip()

        self.stdout.write(f"Checking if user '{user}' exists...")

        if self._user_exists(cursor, user):
            return self.stdout.write(
                self.style.NOTICE(f"User '{user}' already exists. Skipping.")
            )

        self.stdout.write(self.style.NOTICE(f"User '{user}' does not exist. Creating..."))
        cursor.execute(cmd)
        self.stdout.write(self.style.SUCCESS(f"User '{user}' created successfully."))

        return
