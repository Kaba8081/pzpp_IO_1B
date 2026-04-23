from typing import TYPE_CHECKING, cast

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.forum.worlds.managers import WorldManager
from apps.forum.worlds.models import Worlds
from apps.forum.worlds.serializers import WorldSerializer

if TYPE_CHECKING:
    from rest_framework.request import Request

VALIDATION_ERROR_RESPONSE = OpenApiResponse(
    description="Validation errors keyed by field name."
)

_VALID_ORDERINGS = {"id", "-id", "distinct_user_count", "-distinct_user_count"}

USERNAME_QUERY_PARAMETER = OpenApiParameter(
    name="username",
    required=False,
    type=str,
    location=OpenApiParameter.QUERY,
    description="Filter worlds by owner or participant username.",
)

SEARCH_QUERY_PARAMETER = OpenApiParameter(
    name="search",
    required=False,
    type=str,
    location=OpenApiParameter.QUERY,
    description="Case-insensitive substring search on world name.",
)

ORDERING_QUERY_PARAMETER = OpenApiParameter(
    name="ordering",
    required=False,
    type=str,
    location=OpenApiParameter.QUERY,
    description="Sort order. Allowed: id, -id, distinct_user_count, -distinct_user_count.",
)


class WorldPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100


class WorldView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Worlds"],
        description="Returns all available worlds (paginated).",
        parameters=[USERNAME_QUERY_PARAMETER, SEARCH_QUERY_PARAMETER, ORDERING_QUERY_PARAMETER],
        responses={200: WorldSerializer(many=True)},
    )
    def get(self, request: "Request") -> Response:
        username = request.query_params.get("username", "").strip() or None
        search = request.query_params.get("search", "").strip() or None
        ordering = request.query_params.get("ordering", "id")
        if ordering not in _VALID_ORDERINGS:
            ordering = "id"

        world_manager = cast(WorldManager, Worlds.objects)
        queryset = (
            world_manager.get()
            .annotate(
                distinct_user_count=Count('worlduserprofiles__user', distinct=True),
                total_user_profiles_count=Count('worlduserprofiles'),
            )
            .select_related('owner')
            .prefetch_related('owner__userprofile_set')
        )

        if username:
            queryset = queryset.filter(
                Q(owner__userprofile__username=username) |
                Q(worlduserprofiles__user__userprofile__username=username)
            ).distinct()

        if search:
            queryset = queryset.filter(name__icontains=search)

        queryset = queryset.order_by(ordering)

        paginator = WorldPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = WorldSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        tags=["Worlds"],
        description="Create a new world.",
        request=WorldSerializer,
        responses={
            201: WorldSerializer,
            400: VALIDATION_ERROR_RESPONSE,
        },
    )
    def post(self, request: "Request") -> Response:
        serializer = WorldSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WorldDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Worlds"],
        responses={
            200: WorldSerializer,
            404: OpenApiResponse(description="World not found."),
        },
    )
    def get(self, request: "Request", world_id: int) -> Response:
        world_manager = cast(WorldManager, Worlds.objects)
        world = get_object_or_404(world_manager.get(), id=world_id)
        serializer = WorldSerializer(world, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Worlds"],
        request=WorldSerializer,
        responses={
            200: WorldSerializer,
            400: VALIDATION_ERROR_RESPONSE,
            403: OpenApiResponse(description="Forbidden."),
            404: OpenApiResponse(description="World not found."),
        },
    )
    def patch(self, request: "Request", world_id: int) -> Response:
        world_manager = cast(WorldManager, Worlds.objects)
        world = get_object_or_404(world_manager.get(), id=world_id)

        if world.owner_id != request.user.id:
            return Response({"error": "You do not have permission to edit this world."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorldSerializer(world, data=request.data, partial=True, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["Worlds"],
        responses={
            204: OpenApiResponse(description="World deleted."),
            403: OpenApiResponse(description="Forbidden."),
            404: OpenApiResponse(description="World not found."),
        },
    )
    def delete(self, request: "Request", world_id: int) -> Response:
        world_manager = cast(WorldManager, Worlds.objects)
        world = get_object_or_404(world_manager.get(), id=world_id)

        if world.owner_id != request.user.id:
            return Response({"error": "You do not have permission to delete this world."}, status=status.HTTP_403_FORBIDDEN)

        world.deleted_at = timezone.now()
        world.save(update_fields=["deleted_at"])

        return Response(status=status.HTTP_204_NO_CONTENT)

class WorldThumbnailView(APIView):

    def get_permissions(self):
        if self.request.method in ["POST"]:
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Worlds"],
        description="Upload or update a world's thumbnail image.",
        request={
            'application/json': None,
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'image': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'Image file to upload as the world thumbnail.'
                    }
                },
                'required': ['image']
            }
        },
        responses={
            200: WorldSerializer,
            400: VALIDATION_ERROR_RESPONSE,
            403: OpenApiResponse(description="Forbidden."),
            404: OpenApiResponse(description="World not found."),
        },
    )
    def post(self, request: "Request", world_id: int) -> Response:
        world_manager = cast(WorldManager, Worlds.objects)
        world = cast(Worlds, get_object_or_404(world_manager.get(), id=world_id))

        if world.owner != request.user:
            return Response({
                "error": "You do not have permission to update this world's thumbnail."
                }, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('image') # type: ignore
        if not file:
            return Response({"image": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        world.profile_picture = file # type: ignore
        world.save(update_fields=["profile_picture"])

        serializer = WorldSerializer(world, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
