from __future__ import annotations

import socket
from urllib.parse import urlparse

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import DatabaseError, OperationalError


class Command(BaseCommand):
    help = 'Checks connectivity to the configured PostgreSQL and Redis services.'

    def handle(self, *args, **options) -> None:
        errors: list[str] = []

        if not self._check_postgres():
            errors.append('PostgreSQL connection failed.')

        if not self._check_redis():
            errors.append('Redis connection failed.')

        if errors:
            for error in errors:
                self.stderr.write(self.style.ERROR(error))
            raise SystemExit(1)

        self.stdout.write(self.style.SUCCESS('PostgreSQL and Redis are reachable.'))

    def _check_postgres(self) -> bool:
        try:
            connection = connections['default']
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
            return True
        except (DatabaseError, OperationalError) as exc:
            self.stderr.write(self.style.ERROR(f'PostgreSQL check error: {exc}'))
            return False

    def _check_redis(self) -> bool:
        try:
            parsed_url = urlparse(settings.REDIS_URL)
            host = parsed_url.hostname or 'redis'
            port = parsed_url.port or 6379

            with socket.create_connection((host, port), timeout=5) as redis_socket:
                redis_socket.sendall(b'*1\r\n$4\r\nPING\r\n')
                response = redis_socket.recv(16)

            if response != b'+PONG\r\n':
                raise OSError(f'Unexpected Redis response: {response!r}')

            return True
        except OSError as exc:
            self.stderr.write(self.style.ERROR(f'Redis check error: {exc}'))
            return False
