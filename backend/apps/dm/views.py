from typing import TYPE_CHECKING, cast
from django.db import models as db_models
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from apps.dm.models import DirectMessageThread, DirectMessages, DirectMessageReadStatus
from apps.dm.serializers import DirectMessageSerializer, DirectMessageThreadSerializer
from apps.users.models import User

if TYPE_CHECKING:
    from rest_framework.request import Request


class DMMessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class DMThreadListView(APIView):
    """List all DM threads for the current user that have at least one message."""
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["DM"], responses={200: DirectMessageThreadSerializer(many=True)})
    def get(self, request: "Request") -> Response:
        threads = (
            DirectMessageThread.objects
            .filter(
                db_models.Q(user_a=request.user) | db_models.Q(user_b=request.user),
                deleted_at__isnull=True,
            )
            .annotate(msg_count=db_models.Count('messages'))
            .filter(msg_count__gt=0)
            .prefetch_related('messages', 'user_a__userprofile_set', 'user_b__userprofile_set')
            .order_by('-updated_at')
        )
        serializer = DirectMessageThreadSerializer(threads, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DMThreadWithUserView(APIView):
    """Get or create a DM thread with a specific user."""
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["DM"], responses={200: DirectMessageThreadSerializer})
    def post(self, request: "Request", user_id: int) -> Response:
        if user_id == request.user.id:
            return Response({'detail': 'Cannot DM yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        other = cast(User, get_object_or_404(User, pk=user_id))
        if not other.id:
            return Response("User was not found", status=status.HTTP_404_NOT_FOUND)

        # Canonical order: smaller id first
        a_id, b_id = sorted((request.user.id, other.id))
        thread, _ = DirectMessageThread.objects.get_or_create(
            user_a_id=a_id,
            user_b_id=b_id,
        )
        # touch for prefetch
        thread.user_a.userprofile_set.all() # type: ignore
        serializer = DirectMessageThreadSerializer(thread, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DMThreadDetailView(APIView):
    """Get a single DM thread by ID (must be a participant)."""
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["DM"], responses={200: DirectMessageThreadSerializer})
    def get(self, request: "Request", thread_id: int) -> Response:
        try:
            thread = DirectMessageThread.objects.get(pk=thread_id, deleted_at__isnull=True)
        except DirectMessageThread.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if thread.user_a != request.user and thread.user_b != request.user:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DirectMessageThreadSerializer(thread, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DMMessageListView(APIView):
    """List and create messages in a DM thread."""
    permission_classes = [IsAuthenticated]

    def _get_thread(self, thread_id: int, user) -> DirectMessageThread | None:
        try:
            thread = DirectMessageThread.objects.get(pk=thread_id, deleted_at__isnull=True)
        except DirectMessageThread.DoesNotExist:
            return None
        if thread.user_a != user and thread.user_b != user:
            return None
        return thread

    @extend_schema(tags=["DM"], responses={200: DirectMessageSerializer(many=True)})
    def get(self, request: "Request", thread_id: int) -> Response:
        thread = self._get_thread(thread_id, request.user)
        if thread is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        messages = (
            DirectMessages.objects
            .filter(thread=thread, deleted_at__isnull=True)
            .select_related('sender')
            .prefetch_related('sender__userprofile_set')
            .order_by('created_at')
        )
        paginator = DMMessagePagination()
        page = paginator.paginate_queryset(messages, request, view=self)
        if page is not None:
            serializer = DirectMessageSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = DirectMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(tags=["DM"], responses={201: DirectMessageSerializer})
    def post(self, request: "Request", thread_id: int) -> Response:
        thread = self._get_thread(thread_id, request.user)
        if thread is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()  # type: ignore
        if not content:
            return Response({'content': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        message = DirectMessages.objects.create(
            thread=thread,
            sender=request.user,
            content=content,
        )
        serializer = DirectMessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DMMarkReadView(APIView):
    """Mark a DM thread as read for the current user."""
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["DM"], responses={204: None})
    def post(self, request: "Request", thread_id: int) -> Response:
        try:
            thread = DirectMessageThread.objects.get(pk=thread_id, deleted_at__isnull=True)
        except DirectMessageThread.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if thread.user_a != request.user and thread.user_b != request.user:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        latest_id = (
            DirectMessages.objects
            .filter(thread=thread, deleted_at__isnull=True)
            .order_by('-id')
            .values_list('id', flat=True)
            .first()
        )

        DirectMessageReadStatus.objects.update_or_create(
            user=request.user,
            thread=thread,
            defaults={'last_read_message_id': latest_id},
        )

        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'user_{request.user.id}',
                {
                    'type': 'unread.updated',
                    'event': 'unread.updated',
                    'kind': 'dm',
                    'id': thread_id,
                    'unread': False,
                },
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
