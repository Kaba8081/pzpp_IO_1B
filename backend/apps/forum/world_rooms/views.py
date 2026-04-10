from typing import TYPE_CHECKING

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from apps.forum.worlds.models import Worlds
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_rooms.serializers import WorldRoomsSerializer
from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_room_message_actions.models import WorldRoomMessageActions

if TYPE_CHECKING:
    from rest_framework.request import Request


class WorldRoomsListView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Channels"],
        responses={200: WorldRoomsSerializer(many=True)},
    )
    def get(self, request: "Request", world_id: int) -> Response:
        try:
            world = Worlds.objects.get(id=world_id)
        except Worlds.DoesNotExist:
            return Response({"error": "World not found."}, status=status.HTTP_404_NOT_FOUND)

        channels = WorldRooms.objects.filter(world=world)
        serializer = WorldRoomsSerializer(channels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Channels"],
        request=WorldRoomsSerializer,
        responses={
            201: WorldRoomsSerializer,
            400: OpenApiResponse(description="Validation errors."),
            404: OpenApiResponse(description="World not found."),
        },
    )
    def post(self, request: "Request", world_id: int) -> Response:
        try:
            world = Worlds.objects.get(id=world_id)
        except Worlds.DoesNotExist:
            return Response({"error": "World not found."}, status=status.HTTP_404_NOT_FOUND)

        data: dict[str, Any] = dict(request.data)  # type: ignore
        data['world'] = world_id
        
        serializer = WorldRoomsSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WorldRoomsDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Channels"],
        responses={200: WorldRoomsSerializer, 404: OpenApiResponse(description="Channel not found.")},
    )
    def get(self, request: "Request", channel_id: int) -> Response:
        try:
            channel = WorldRooms.objects.get(id=channel_id)
        except WorldRooms.DoesNotExist:
            return Response({"error": "Channel not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorldRoomsSerializer(channel)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Channels"],
        request=WorldRoomsSerializer,
        responses={
            200: WorldRoomsSerializer,
            400: OpenApiResponse(description="Validation errors."),
            404: OpenApiResponse(description="Channel not found."),
        },
    )
    def patch(self, request: "Request", channel_id: int) -> Response:
        try:
            channel = WorldRooms.objects.get(id=channel_id)
        except WorldRooms.DoesNotExist:
            return Response({"error": "Channel not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorldRoomsSerializer(channel, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Channels"],
        responses={
            204: OpenApiResponse(description="No Content."),
            404: OpenApiResponse(description="Channel not found."),
        },
    )
    def delete(self, request: "Request", channel_id: int) -> Response:
        try:
            channel = WorldRooms.objects.get(id=channel_id)
        except WorldRooms.DoesNotExist:
            return Response({"error": "Channel not found."}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            # Delete related messages and their actions.
            messages = WorldRoomMessages.objects.filter(room=channel)
            WorldRoomMessageActions.objects.filter(message__in=messages).delete()
            messages.delete()
            channel.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
