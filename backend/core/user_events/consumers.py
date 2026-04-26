import json
from typing import Any

from channels.generic.websocket import AsyncWebsocketConsumer


class UserEventsConsumer(AsyncWebsocketConsumer):
    user_group_name: str

    async def connect(self) -> None:
        user = self.scope.get('user')
        if user is None or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.user_group_name = f'user_{user.id}'
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code: int) -> None:
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data: str | None = None, bytes_data: bytes | None = None) -> None:
        return

    async def permissions_updated(self, event: dict[str, Any]) -> None:
        await self.send(text_data=json.dumps({
            'event': event['event'],
            'world_id': event['world_id'],
        }))

    async def unread_updated(self, event: dict[str, Any]) -> None:
        await self.send(text_data=json.dumps({
            'event': event['event'],
            'kind': event['kind'],
            'id': event['id'],
            'unread': event['unread'],
        }))
