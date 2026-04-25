from typing import TYPE_CHECKING, Any, cast

from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.forum.worlds.models import Worlds
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_rooms.serializers import WorldRoomsSerializer, WorldRoomsUpdateSerializer
from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_room_message_actions.models import WorldRoomMessageActions
from apps.forum.world_rooms.managers import WorldRoomManager

if TYPE_CHECKING:
    from rest_framework.request import Request

VALIDATION_ERROR_RESPONSE = OpenApiResponse(
    description="Validation errors keyed by field name."
)

THUMBNAIL_UPDATE_NOT_ALLOWED_ERROR = {
    "thumbnail": "Use the room thumbnail endpoint to update the thumbnail."
}

class WorldRoomsListView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Rooms"],
        responses={200: WorldRoomsSerializer(many=True)},
    )
    def get(self, request: "Request", world_id: int) -> Response:
        try:
            world = Worlds.objects.get(id=world_id)
        except Worlds.DoesNotExist:
            return Response({"error": "World not found."}, status=status.HTTP_404_NOT_FOUND)

        rooms = WorldRooms.objects.filter(world=world)
        serializer = WorldRoomsSerializer(rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Rooms"],
        request=WorldRoomsSerializer,
        responses={
            201: WorldRoomsSerializer,
            400: OpenApiResponse(description="Validation errors."),
            404: OpenApiResponse(description="World not found."),
        },
    )
    def post(self, request: "Request", world_id: int) -> Response:
        if not Worlds.objects.filter(id=world_id).exists():
            return Response({"error": "World not found."}, status=status.HTTP_404_NOT_FOUND)

        data: dict[str, Any] = dict(request.data)  # type: ignore

        if "thumbnail" in data:
            return Response(THUMBNAIL_UPDATE_NOT_ALLOWED_ERROR, status=status.HTTP_400_BAD_REQUEST)

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
        tags=["Rooms"],
        responses={200: WorldRoomsSerializer, 404: OpenApiResponse(description="Channel not found.")},
    )
    def get(self, request: "Request", room_id: int) -> Response:
        try:
            channel = WorldRooms.objects.get(id=room_id)
        except WorldRooms.DoesNotExist:
            return Response({"error": "Channel not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WorldRoomsSerializer(channel)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Rooms"],
        request=WorldRoomsUpdateSerializer,
        responses={
            200: WorldRoomsSerializer,
            400: OpenApiResponse(description="Validation errors."),
            404: OpenApiResponse(description="Channel not found."),
        },
    )
    def patch(self, request: "Request", room_id: int) -> Response:
        try:
            channel = WorldRooms.objects.get(id=room_id)
        except WorldRooms.DoesNotExist:
            return Response({"error": "Channel not found."}, status=status.HTTP_404_NOT_FOUND)

        data: dict[str, Any] = dict(request.data)  # type: ignore

        if "thumbnail" in data:
            return Response(THUMBNAIL_UPDATE_NOT_ALLOWED_ERROR, status=status.HTTP_400_BAD_REQUEST)

        # Later on this is where the permission check would go
        world = channel.world
        if world.owner != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorldRoomsSerializer(channel, data=data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Rooms"],
        responses={
            204: OpenApiResponse(description="No Content."),
            404: OpenApiResponse(description="Channel not found."),
        },
    )
    def delete(self, request: "Request", room_id: int) -> Response:
        try:
            channel = WorldRooms.objects.get(id=room_id)
        except WorldRooms.DoesNotExist:
            return Response({"error": "Channel not found."}, status=status.HTTP_404_NOT_FOUND)

        # Later on this is where the permission check would go
        world = channel.world
        if world.owner != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            messages = WorldRoomMessages.objects.filter(room=channel)

            WorldRoomMessageActions.objects.filter(message__in=messages).update(deleted_at=timezone.now())
            messages.update(deleted_at=timezone.now())
            channel.deleted_at = timezone.now()
            channel.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

class WorldRoomThumbnailView(APIView):

    def get_permissions(self):
        if self.request.method in ["POST"]:
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Rooms"],
        description="Upload or update a room's thumbnail image.",
        request={
            'application/json': None,
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'image': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'Image file to upload as the room thumbnail.'
                    }
                },
                'required': ['image']
            }
        },
        responses={
            200: WorldRoomsSerializer,
            400: VALIDATION_ERROR_RESPONSE,
            403: OpenApiResponse(description="Forbidden."),
            404: OpenApiResponse(description="World not found."),
        },
    )
    def post(self, request: "Request", room_id: int) -> Response:
        manager = cast(WorldRoomManager, WorldRooms.objects)
        room = cast(WorldRooms, get_object_or_404(manager.get(), id=room_id))

        if room.world.owner != request.user:
            return Response({
                "error": "You do not have permission to update this world's thumbnail."
                }, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('image') # type: ignore
        if not file:
            return Response({"image": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        room.thumbnail = file # type: ignore
        room.save(update_fields=["thumbnail"])

        serializer = WorldRoomsSerializer(room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
