import json
from typing import Any

from channels.generic.websocket import AsyncWebsocketConsumer


class WorldEventsConsumer(AsyncWebsocketConsumer):
    world_group_name: str

    async def connect(self) -> None:
        user = self.scope.get('user')
        if user is None or not user.is_authenticated:
            await self.close(code=4401)
            return

        url_route: Any = self.scope.get('url_route')
        if not isinstance(url_route, dict):
            await self.close(code=4400)
            return

        kwargs = url_route.get('kwargs')
        if not isinstance(kwargs, dict):
            await self.close(code=4400)
            return

        world_id = kwargs.get('world_id')
        if world_id is None:
            await self.close(code=4400)
            return

        self.world_group_name = f'world_{world_id}'
        await self.channel_layer.group_add(self.world_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code: int) -> None:
        if hasattr(self, 'world_group_name'):
            await self.channel_layer.group_discard(self.world_group_name, self.channel_name)

    async def receive(self, text_data: str | None = None, bytes_data: bytes | None = None) -> None:
        return

    async def world_profile_created(self, event: dict) -> None:
        await self.send(
            text_data=json.dumps({
                'event': event['event'],
                'world_id': event['world_id'],
                'profile': event['profile'],
            })
        )
