from typing import TYPE_CHECKING, cast

from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import permissions, status
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

USERNAME_QUERY_PARAMETER = OpenApiParameter(
	name="username",
	required=False,
	type=str,
	location=OpenApiParameter.QUERY,
	description="Reserved for future filtering by owner username.",
)


class WorldView(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["Worlds"],
        description="Returns all available worlds.",
        parameters=[USERNAME_QUERY_PARAMETER],
        responses={200: WorldSerializer(many=True)},
    )
    def get(self, request: "Request") -> Response:
        username = request.query_params.get("username")
        world_manager = cast(WorldManager, Worlds.objects)

        queryset = world_manager.get().annotate(user_count_annotated=Count('worlduserprofiles')).order_by("id")

        if username:
            username = username.strip()
            queryset = queryset.filter(worlduserprofiles__user__username=username)

        for world in queryset:
            world.user_count = getattr(world, 'user_count_annotated', 0)

        serializer = WorldSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

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

        serializer.save(owner_id=request.user.id)
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
