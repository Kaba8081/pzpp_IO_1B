# pylint: disable=wrong-import-position
"""
ASGI config for pzpp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pzpp.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from django.urls import re_path

from apps.forum.routing import websocket_urlpatterns as forum_ws_patterns
from apps.dm.routing import websocket_urlpatterns as dm_ws_patterns
from core.user_events.consumers import UserEventsConsumer
from core.ws_auth.middleware import WsTicketMiddleware

user_ws_patterns = [
    re_path(r'^ws/events/$', UserEventsConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': WsTicketMiddleware(
            URLRouter(forum_ws_patterns + dm_ws_patterns + user_ws_patterns)
        ),
    }
)
