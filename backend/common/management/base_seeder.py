import abc
from pathlib import Path
from dataclasses import dataclass
import random
import asyncio

from django.core.management.base import BaseCommand, CommandParser
from django.conf import settings

from common.utils import download_images_progress

@dataclass
class SeederConfig:
    object_count = 10

    prepare_images: bool = False
    img_count: int = 0
    img_folder: Path = Path(settings.MEDIA_ROOT) / ""

class BaseSeeder(BaseCommand, abc.ABC):
    help = "An abstract base seeder"
    config: SeederConfig = SeederConfig()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._prepared = False
        self._image_cache = {}

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            '--count',
            type=int,
            help='The amount of objects to create',
            default=self.config.object_count
        )

        if self.config.prepare_images:
            parser.add_argument(
                '--img_count',
                type=int,
                help='The amount of images to prepare',
                default=self.config.img_count
            )

    def prepare(self, *args, **kwargs) -> None:
        """
        Override in subclasses for setup logic. Call super().prepare() to set the _prepared flag.
        """
        self.config.object_count = int(kwargs.get('count', self.config.object_count))
        self.config.img_count = int(kwargs.get('img_count', self.config.img_count))

        if self.config.prepare_images:
            self._prepare_images(self.config.img_folder, self.config.img_count)

        self._prepared = True

    @abc.abstractmethod
    def seed(self, *args, **kwargs) -> None:
        """
        Subclasses must implement this with the actual seeding logic.
        """
        return

    def handle(self, *args, **kwargs) -> None:
        if not self._prepared:
            self.prepare(*args, **kwargs)

        self.seed(*args, **kwargs)

    def get_random_image(self, folder: Path) -> Path | None:
        folder_path = Path(settings.MEDIA_ROOT) / folder
        cache_key = str(folder_path.resolve())

        if cache_key not in self._image_cache:
            images = list(folder_path.glob('*.jpg'))
            self._image_cache[cache_key] = images
        else:
            images = self._image_cache[cache_key]

        if not images:
            return None
        return random.choice(images)

    def to_media_relative_path(self, image_path: Path | None) -> str | None:
        if image_path is None:
            return None

        media_root = Path(settings.MEDIA_ROOT).resolve()
        image_path = image_path.resolve()
        return str(image_path.relative_to(media_root)).replace('\\', '/')

    def _prepare_images(
        self,
        path: Path,
        count: int = 10,
        interval: float = 1.
    ) -> None:
        path.mkdir(parents=True, exist_ok=True)
        existing_images = list(path.glob('*.jpg'))
        missing = max(0, count - len(existing_images))
        if missing == 0:
            self.stdout.write(f"[PREPARE] All {count} images in {path} already exist. Skipping download.")
            return

        async def run_progress():
            last = 0
            self.stdout.write(f"[PREPARE] Downloading images to {path} ({len(existing_images)}/{count})...", ending="\r")
            async for downloaded in download_images_progress(path, missing, interval, len(existing_images)):
                last = downloaded
                self.stdout.write(f"[PREPARE] Downloading images to {path} ({downloaded + len(existing_images)}/{count})...", ending="\r")
                self.stdout.flush()
            self.stdout.write(f"[PREPARE] Downloading images to {path} ({last + len(existing_images)}/{count})...\n")

        asyncio.run(run_progress())
