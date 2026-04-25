from django.core import signing
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class WsTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["WebSocket"],
        description="Issue a short-lived one-time ticket for WebSocket authentication.",
        responses={200: {"type": "object", "properties": {"ticket": {"type": "string"}}}},
    )
    def post(self, request):
        ticket = signing.dumps({"user_id": request.user.pk}, salt="ws_ticket")
        return Response({"ticket": ticket})
