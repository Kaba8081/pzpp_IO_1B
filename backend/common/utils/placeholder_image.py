# pylint: disable=W0718:broad-exception-caught
from typing import AsyncGenerator
from pathlib import Path
import asyncio
import httpx

async def _download_image(path: Path, i: int) -> str | None:
    """
    Asynchronously downloads a random image and saves it to the given path
    """

    image_path = path / f"image_{i}.jpg"
    if not image_path.exists():
        try:
            url = "https://picsum.photos/800/600"
            async with httpx.AsyncClient(timeout=5, follow_redirects=False) as client:
                response = await client.get(url)
                if response.status_code == 302:
                    redirect_url = response.headers.get("location")
                    if not redirect_url:
                        print(f"Warning: No redirect location for image {i}")
                        return None
                    response = await client.get(redirect_url)
                response.raise_for_status()
                with open(image_path, 'wb') as f:
                    f.write(response.content)
        except Exception as e:
            print(f"Warning: Failed to download image {i} ({e})")
            return None
    return str(image_path)

async def download_images(path: Path, count=1) -> AsyncGenerator[int, None]:
    """
    Async generator that yields downloaded images
    """

    path.mkdir(parents=True, exist_ok=True)
    tasks = [_download_image(path, i) for i in range(1, count + 1)]
    results = await asyncio.gather(*tasks)
    downloaded = 0
    for result in results:
        if result:
            downloaded += 1
        yield downloaded

async def download_images_progress(
        path: Path,
        count: int = 1,
        interval: float = 2.,
        start_index: int = 1,
    ) -> AsyncGenerator[int, None]:
    """
    Async generator that yields the number of images downloaded every `interval` seconds.
    """
    path.mkdir(parents=True, exist_ok=True)
    loop = asyncio.get_event_loop()

    # This limits the concurent downloads to 15
    # setting it higher causes network-dropout issues
    semaphore = asyncio.Semaphore(15)

    async def sem_download(i):
        async with semaphore:
            return await _download_image(path, i)

    tasks = [asyncio.ensure_future(sem_download(i)) for i in range(start_index, start_index + count)]
    downloaded = 0
    start = loop.time()
    last_yield = start
    for coro in asyncio.as_completed(tasks):
        try:
            if await coro:
                downloaded += 1
        except Exception:
            pass
        now = loop.time()
        if now - last_yield >= interval or downloaded == count:
            yield downloaded
            last_yield = now
