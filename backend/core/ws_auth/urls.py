from django.urls import path

from core.ws_auth.views import WsTicketView

urlpatterns = [
    path("ticket/", WsTicketView.as_view(), name="ws-ticket"),
]
