from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core import signing

User = get_user_model()

TICKET_MAX_AGE = 60  # seconds — ticket expires after this many seconds


class WsTicketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            scope.setdefault("user", AnonymousUser()) # type: ignore
            query_params = parse_qs(scope.get("query_string", b"").decode())
            tickets = query_params.get("ticket", [])
            if tickets:
                try:
                    data = signing.loads(
                        tickets[0], salt="ws_ticket", max_age=TICKET_MAX_AGE
                    )
                    scope["user"] = await sync_to_async(User.objects.get)( # type: ignore
                        pk=data["user_id"]
                    )
                except (signing.BadSignature, User.DoesNotExist):
                    pass

        return await super().__call__(scope, receive, send)
