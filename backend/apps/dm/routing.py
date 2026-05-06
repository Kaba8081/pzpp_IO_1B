# type: ignore[reportArgumentType, reportCallIssue]
from django.urls import re_path

from apps.dm.consumers import DirectMessageConsumer

websocket_urlpatterns = [
    re_path(r'^ws/dm/(?P<thread_id>\d+)/$', DirectMessageConsumer.as_asgi()),
]
