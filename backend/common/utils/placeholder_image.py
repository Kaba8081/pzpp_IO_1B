# pylint: disable=W0718:broad-exception-caught
from typing import AsyncGenerator
from pathlib import Path
import asyncio
import httpx

async def _download_image(path: Path, i: int) -> str | None:
    """
    Asynchronously downloads a random image and saves it to the given path
    """

    if not path.exists():
        try:
            url = f"https://picsum.photos/seed/{i}/800/600"
            async with httpx.AsyncClient(timeout=5, follow_redirects=False) as client:
                response = await client.get(url)
                if response.status_code == 302:
                    redirect_url = response.headers.get("location")
                    if not redirect_url:
                        print(f"Warning: No redirect location for image {i}")
                        return None
                    response = await client.get(redirect_url)
                response.raise_for_status()
                with open(path, 'wb') as f:
                    f.write(response.content)
        except Exception as e:
            print(f"Warning: Failed to download image {i} ({e})")
            return None
    return f"{path}/image_{i}.jpg"

async def download_images(path: Path, count=1) -> AsyncGenerator[int, None]:
    """
    Async generator that yields downloaded images
    """

    path.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    for i in range(1, count + 1):
        result = await _download_image(path, i)
        if result:
            downloaded += 1
        yield downloaded

async def download_images_progress(
        path: Path,
        count: int = 1,
        interval: float = 2.
    ) -> AsyncGenerator[int, None]:
    """
    Async generator that yields the number of images downloaded every `interval` seconds.
    """
    gen = download_images(path, count)
    downloaded = 0
    start = asyncio.get_event_loop().time()
    async for d in gen:
        downloaded = d
        now = asyncio.get_event_loop().time()
        if now - start >= interval:
            yield downloaded
            start = now

    yield downloaded
