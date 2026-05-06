# type: ignore[reportArgumentType, reportCallIssue]
from django.urls import re_path

from apps.forum.world_room_messages.consumers import WorldRoomMessageConsumer
from apps.forum.world_user_profiles.consumers import WorldEventsConsumer

websocket_urlpatterns = [
    re_path(r'^ws/forum/rooms/(?P<room_id>\d+)/messages/$', WorldRoomMessageConsumer.as_asgi()),
    re_path(r'^ws/forum/world/(?P<world_id>\d+)/events/$', WorldEventsConsumer.as_asgi()),
]
