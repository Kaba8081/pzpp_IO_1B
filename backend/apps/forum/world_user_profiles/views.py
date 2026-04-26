from typing import TYPE_CHECKING, Any, cast
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import OpenApiResponse, extend_schema
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.forum.world_user_profiles.models import WorldUserProfiles
from apps.forum.world_user_profiles.serializers import (
    WorldUserProfilesSerializer,
    WorldUserProfilesUpdateSerializer,
    WorldUserProfilePublicSerializer,
)
from apps.forum.world_room_messages.models import WorldRoomMessages
from apps.forum.world_user_profiles.managers import WorldUserProfilesManager

if TYPE_CHECKING:
    from rest_framework.request import Request

VALIDATION_ERROR_RESPONSE = OpenApiResponse(
    description="Validation errors keyed by field name."
)

class WorldProfilesByWorldView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["World Profiles"],
        responses={200: WorldUserProfilesSerializer(many=True)},
    )
    def get(self, request: "Request", world_id: int) -> Response:
        profiles = WorldUserProfiles.objects.filter(user=request.user, world_id=world_id)
        serializer = WorldUserProfilesSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["World Profiles"],
        request=WorldUserProfilesSerializer,
        responses={
            201: WorldUserProfilesSerializer,
            400: None,
        },
    )
    def post(self, request: "Request", world_id: int) -> Response:
        data: dict[str, Any] = dict(request.data)  # type: ignore
        data['world'] = world_id
        serializer = WorldUserProfilesSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllProfilesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["World Profiles"],
        responses={200: WorldUserProfilesSerializer(many=True)},
    )
    def get(self, request: "Request") -> Response:
        profiles = WorldUserProfiles.objects.filter(user=request.user)
        serializer = WorldUserProfilesSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, profile_id: int):
        return get_object_or_404(WorldUserProfiles, pk=profile_id)

    @extend_schema(
        tags=["World Profiles"],
        responses={
            200: WorldUserProfilesSerializer,
            404: None,
        },
    )
    def get(self, request: "Request", profile_id: int) -> Response:
        profile = self.get_object(profile_id)
        serializer = WorldUserProfilesSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["World Profiles"],
        request=WorldUserProfilesUpdateSerializer,
        responses={
            200: WorldUserProfilesSerializer,
            400: None,
            403: None,
            404: None,
        },
    )
    def patch(self, request: "Request", profile_id: int) -> Response:
        profile = self.get_object(profile_id)
        if profile.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorldUserProfilesSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        tags=["World Profiles"],
        responses={
            204: None,
            403: None,
            404: None,
        },
    )
    def delete(self, request: "Request", profile_id: int) -> Response:
        profile = self.get_object(profile_id)
        if profile.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        profile.deleted_at = now
        profile.save()

        # Soft-delete related messages
        WorldRoomMessages.objects.filter(user_profile=profile).update(deleted_at=now)

        return Response(status=status.HTTP_204_NO_CONTENT)

class WorldMembersView(APIView):
    """List all WorldUserProfiles in a world (any user), for the channel room sidebar."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["World Profiles"],
        responses={200: WorldUserProfilePublicSerializer(many=True)},
    )
    def get(self, request: "Request", world_id: int) -> Response:
        profiles = WorldUserProfiles.objects.filter(
            world_id=world_id,
            deleted_at__isnull=True,
        ).select_related('user')
        serializer = WorldUserProfilePublicSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileAvatarView(APIView):

    def get_permissions(self):
        if self.request.method in ["POST"]:
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        tags=["World Profiles"],
        description="Upload or update a world profile's avatar image.",
        request={
            'application/json': None,
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'image': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'Image file to upload as the profile thumbnail.'
                    }
                },
                'required': ['image']
            }
        },
        responses={
            200: WorldUserProfilesSerializer,
            400: VALIDATION_ERROR_RESPONSE,
            403: OpenApiResponse(description="Forbidden."),
            404: OpenApiResponse(description="Profile not found."),
        },
    )
    def post(self, request: "Request", profile_id: int) -> Response:
        manager = cast(WorldUserProfilesManager, WorldUserProfiles.objects)
        profile = cast(WorldUserProfiles, get_object_or_404(manager.get(), id=profile_id))

        if profile.user != request.user:
            return Response({
                "error": "You do not have permission to update this user's avatar."
            }, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('image') # type: ignore
        if not file:
            return Response({"image": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        profile.avatar = file # type: ignore
        profile.save(update_fields=["avatar"])

        serializer = WorldUserProfilesSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
