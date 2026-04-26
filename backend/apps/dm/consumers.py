import json
from typing import Any

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import Q


class DirectMessageConsumer(AsyncWebsocketConsumer):
    thread_group_name: str

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

        thread_id = kwargs.get('thread_id')
        if thread_id is None:
            await self.close(code=4400)
            return

        if not await self._is_participant(thread_id, user):
            await self.close(code=4403)
            return

        self.thread_group_name = f'dm_thread_{thread_id}'
        await self.channel_layer.group_add(self.thread_group_name, self.channel_name)
        await self.accept()

    @database_sync_to_async
    def _is_participant(self, thread_id: int, user) -> bool:
        from apps.dm.models import DirectMessageThread
        return DirectMessageThread.objects.filter(
            pk=thread_id,
            deleted_at__isnull=True,
        ).filter(Q(user_a=user) | Q(user_b=user)).exists()

    async def disconnect(self, code: int) -> None:
        if hasattr(self, 'thread_group_name'):
            await self.channel_layer.group_discard(self.thread_group_name, self.channel_name)

    async def receive(self, text_data: str | None = None, bytes_data: bytes | None = None) -> None:
        return

    async def dm_message_created(self, event: dict) -> None:
        await self.send(
            text_data=json.dumps({
                'event': event['event'],
                'thread_id': event['thread_id'],
                'message': event['message'],
            })
        )
