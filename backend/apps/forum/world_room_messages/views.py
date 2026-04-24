from typing import TYPE_CHECKING, Any

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_room_messages.serializers import WorldRoomMessagesSerializer
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_room_message_actions.models import WorldRoomMessageActions
from apps.forum.world_user_profiles.models import WorldUserProfiles

if TYPE_CHECKING:
    from rest_framework.request import Request


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ChannelMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Messages"],
        responses={200: WorldRoomMessagesSerializer(many=True)},
    )
    def get(self, request: "Request", channel_id: int) -> Response:
        channel = get_object_or_404(WorldRooms, id=channel_id)

        messages = WorldRoomMessages.objects.filter(room=channel).order_by('created_at')

        paginator = MessagePagination()
        page = paginator.paginate_queryset(messages, request, view=self)
        if page is not None:
            serializer = WorldRoomMessagesSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = WorldRoomMessagesSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Messages"],
        request=WorldRoomMessagesSerializer,
        responses={
            201: WorldRoomMessagesSerializer,
            400: None,
            404: None,
        },
    )
    def post(self, request: "Request", channel_id: int) -> Response:
        channel = get_object_or_404(WorldRooms, id=channel_id)

        data: dict[str, Any] = dict(request.data)  # type: ignore
        user_profile_id = data.get('user_profile')
        if not user_profile_id:
            return Response({"detail": "User profile is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            WorldUserProfiles.objects.get(id=user_profile_id, user=request.user)
        except WorldUserProfiles.DoesNotExist:
            return Response({"detail": "Permission denied. Profile not found or not owned by user."}, status=status.HTTP_403_FORBIDDEN)

        data['room'] = channel.id

        serializer = WorldRoomMessagesSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Messages"],
        request=WorldRoomMessagesSerializer,
        responses={
            200: WorldRoomMessagesSerializer,
            400: None,
            404: None,
        },
    )
    def patch(self, request: "Request", message_id: int) -> Response:
        message = get_object_or_404(WorldRoomMessages, id=message_id)

        if message.user_profile.user != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorldRoomMessagesSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        tags=["Messages"],
        responses={
            204: None,
            404: None,
        },
    )
    def delete(self, request: "Request", message_id: int) -> Response:
        message = get_object_or_404(WorldRoomMessages, id=message_id)

        if message.user_profile.user != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            now = timezone.now()
            message.deleted_at = now
            message.save()

            WorldRoomMessageActions.objects.filter(message=message).update(deleted_at=now)

        return Response(status=status.HTTP_204_NO_CONTENT)
