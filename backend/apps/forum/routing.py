# type: ignore[reportArgumentType, reportCallIssue]
from django.urls import re_path

from apps.forum.world_room_messages.consumers import WorldRoomMessageConsumer

websocket_urlpatterns = [
    re_path(r'^ws/forum/rooms/(?P<room_id>\d+)/messages/$', WorldRoomMessageConsumer.as_asgi()),
]
