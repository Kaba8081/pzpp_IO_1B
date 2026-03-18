from typing import TYPE_CHECKING, cast

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

        queryset = world_manager.get().order_by("id")

        if username:
            username = username.strip()

        # world-profile filtering would go here

        serializer = WorldSerializer(queryset, many=True)
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
        serializer = WorldSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(owner_id=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
