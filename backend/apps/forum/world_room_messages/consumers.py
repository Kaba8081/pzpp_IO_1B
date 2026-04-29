import json
from typing import Any

from channels.generic.websocket import AsyncWebsocketConsumer


class WorldRoomMessageConsumer(AsyncWebsocketConsumer):
    room_group_name: str

    async def connect(self) -> None:
        url_route: Any = self.scope.get('url_route')
        if not isinstance(url_route, dict):
            await self.close(code=4400)
            return

        kwargs = url_route.get('kwargs')
        if not isinstance(kwargs, dict):
            await self.close(code=4400)
            return

        room_id = kwargs.get('room_id')
        if room_id is None:
            await self.close(code=4400)
            return

        self.room_group_name = f'world_room_{room_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code: int) -> None:
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data: str | None = None, bytes_data: bytes | None = None) -> None:
        # This consumer is broadcast-only for now.
        return

    async def room_message_created(self, event: dict) -> None:
        await self.send(
            text_data=json.dumps(
                {
                    'event': event['event'],
                    'room_id': event['room_id'],
                    'message': event['message'],
                }
            )
        )

    async def room_message_deleted(self, event: dict) -> None:
        await self.send(
            text_data=json.dumps(
                {
                    'event': event['event'],
                    'room_id': event['room_id'],
                    'message_id': event['message_id'],
                }
            )
        )
