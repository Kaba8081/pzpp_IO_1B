from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.forum.models import Worlds, WorldRooms, WorldUserProfiles
from apps.users.models import UserProfile


class Command(BaseCommand):
    help = 'Fixes image field values that were saved as absolute filesystem paths.'

    def handle(self, *args, **options) -> None:
        total_fixed = 0

        total_fixed += self._fix_field(Worlds, 'profile_picture')
        total_fixed += self._fix_field(WorldRooms, 'thumbnail')
        total_fixed += self._fix_field(WorldUserProfiles, 'avatar')
        total_fixed += self._fix_field(UserProfile, 'profile_picture')

        self.stdout.write(self.style.SUCCESS(f'Fixed {total_fixed} image path value(s).'))

    def _fix_field(self, model, field_name: str) -> int:
        fixed = 0
        media_root = str(Path(settings.MEDIA_ROOT).resolve()).replace('\\', '/')

        for obj in model.objects.all():
            field_file = getattr(obj, field_name)
            if not field_file:
                continue

            current_value = str(field_file.name).replace('\\', '/')
            if not current_value.startswith(media_root):
                continue

            relative_value = current_value[len(media_root):].lstrip('/')
            setattr(obj, field_name, relative_value)
            obj.save(update_fields=[field_name])
            fixed += 1

        if fixed:
            self.stdout.write(f'{model.__name__}.{field_name}: fixed {fixed}')

        return fixed
