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

from apps.forum.routing import websocket_urlpatterns
from core.ws_auth.middleware import WsTicketMiddleware

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': WsTicketMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
