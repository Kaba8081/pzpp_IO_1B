from typing import TYPE_CHECKING

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from apps.forum.permissions import user_has_permission
from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_room_messages.serializers import (
    WorldRoomMessagesSerializer,
    CreateMediaMessageSerializer,
    CreateTextMessageSerializer,
)
from apps.forum.world_room_messages.services import create_media_message
from apps.forum.world_rooms.models import WorldRooms
from apps.forum.world_room_message_actions.models import WorldRoomMessageActions
from apps.forum.world_user_profiles.models import WorldUserProfiles

if TYPE_CHECKING:
    from rest_framework.request import Request


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_page_number(self, request, paginator):
        page_number = request.query_params.get(self.page_query_param)
        if not page_number:
            return paginator.num_pages
        return super().get_page_number(request, paginator)


class ChannelMessagesView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Messages"],
        responses={200: WorldRoomMessagesSerializer(many=True)},
    )
    def get(self, request: "Request", room_id: int) -> Response:
        channel = get_object_or_404(WorldRooms, id=room_id)

        messages = WorldRoomMessages.objects.available().filter(room=channel).select_related(
            'user_profile'
        ).prefetch_related(
            'media_message', 'system_message', 'system_message__user_profile'
        ).order_by('created_at')

        paginator = MessagePagination()
        page = paginator.paginate_queryset(messages, request, view=self)
        if page is not None:
            serializer = WorldRoomMessagesSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = WorldRoomMessagesSerializer(messages, many=True, context={'request': request})
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
    def post(self, request: "Request", room_id: int) -> Response:
        channel = get_object_or_404(WorldRooms.objects.select_related("world__owner"), id=room_id)

        if not user_has_permission(request.user, channel.world, "send_messages"):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        user_profile_id = request.data.get('user_profile') # type: ignore
        if not user_profile_id:
            return Response({"detail": "User profile is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_profile = WorldUserProfiles.objects.get(id=user_profile_id, user=request.user)
        except WorldUserProfiles.DoesNotExist:
            return Response({"detail": "Permission denied. Profile not found or not owned by user."}, status=status.HTTP_403_FORBIDDEN)

        # Verify user_profile belongs to the same world as the room
        if user_profile.world.id != channel.world.id:
            return Response(
                {"detail": "The user profile must belong to the same world as the room."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if this is a media message
        file = request.FILES.get('file') # type: ignore
        if file:
            # Handle media message
            media_type = request.data.get('media_type') # type: ignore
            if not media_type:
                return Response({"detail": "media_type is required for media messages."}, status=status.HTTP_400_BAD_REQUEST)

            # Validate media message input
            media_serializer = CreateMediaMessageSerializer(data={
                'user_profile': user_profile_id,
                'file': file,
                'media_type': media_type,
            })
            if not media_serializer.is_valid():
                return Response(media_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            try:
                message = create_media_message(
                    room=channel,
                    user_profile=user_profile,
                    file=file,
                    media_type=media_type,
                )
                serializer = WorldRoomMessagesSerializer(message, context={'request': request})
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Handle text message
            content = request.data.get('content') # type: ignore
            if not content:
                return Response({"detail": "Content or file is required."}, status=status.HTTP_400_BAD_REQUEST)

            text_serializer = CreateTextMessageSerializer(data={
                'user_profile': user_profile_id,
                'content': content,
            })
            if not text_serializer.is_valid():
                return Response(text_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            data = {
                'user_profile': user_profile_id,
                'room': channel.id,
                'content': content,
            }
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

        message_user_profile = message.user_profile
        if message_user_profile is None:
            return Response({"detail": "Message profile not found."}, status=status.HTTP_404_NOT_FOUND)

        if message_user_profile.user != request.user:
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
        message = get_object_or_404(
            WorldRoomMessages.objects.select_related("user_profile__user", "room__world__owner"),
            id=message_id,
        )

        message_user_profile = message.user_profile
        if message_user_profile is None:
            return Response({"detail": "Message profile not found."}, status=status.HTTP_404_NOT_FOUND)

        if message_user_profile.user != request.user and not user_has_permission(
            request.user, message.room.world, "manage_messages"
        ):
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        room_id = message.room_id

        with transaction.atomic():
            now = timezone.now()
            message.deleted_at = now
            message.save()

            WorldRoomMessageActions.objects.filter(message=message).update(deleted_at=now)

            try:
                media = message.media_message
                if media.file:
                    media.file.delete(save=False)
                media.delete()
            except WorldRoomMessages.media_message.RelatedObjectDoesNotExist:
                pass

            def _broadcast_deleted():
                channel_layer = get_channel_layer()
                if channel_layer is None:
                    return
                async_to_sync(channel_layer.group_send)(
                    f'world_room_{room_id}',
                    {
                        'type': 'room.message.deleted',
                        'event': 'room.message.deleted',
                        'room_id': room_id,
                        'message_id': message_id,
                    },
                )

            transaction.on_commit(_broadcast_deleted)

        return Response(status=status.HTTP_204_NO_CONTENT)
