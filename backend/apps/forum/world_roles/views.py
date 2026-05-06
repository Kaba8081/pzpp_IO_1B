from typing import TYPE_CHECKING, cast

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.forum.permissions import user_has_permission
from apps.forum.world_role_has_permissions.models import WorldRoleHasPermissions
from apps.forum.world_role_permissions.models import WorldRolePermissions
from apps.forum.world_roles.models import WorldRoles
from apps.forum.world_roles.serializers import (
    WorldRolePermissionSerializer,
    WorldRolesSerializer,
    WorldRolesWriteSerializer,
)
from apps.forum.world_user_has_roles.models import WorldUserHasRoles
from apps.forum.worlds.models import Worlds
from apps.users.models import User

if TYPE_CHECKING:
    from rest_framework.request import Request

FORBIDDEN = {"error": "You do not have permission to manage roles in this world."}


def _get_world(world_id: int) -> Worlds:
    return get_object_or_404(Worlds.objects, id=world_id)


def _get_role(world: Worlds, role_id: int) -> WorldRoles:
    return get_object_or_404(WorldRoles.objects.filter(world=world), id=role_id)


def _apply_permissions(role: WorldRoles, permission_ids: list[int]) -> None:
    WorldRoleHasPermissions.objects.filter(role=role).update(deleted_at=timezone.now())
    WorldRoleHasPermissions.objects.bulk_create([
        WorldRoleHasPermissions(role=role, permission_id=pid)
        for pid in permission_ids
    ])


def _push_permissions_event(world_id: int, user_id: int) -> None:
    layer = get_channel_layer()
    if layer is None:
        return
    async_to_sync(layer.group_send)(
        f'user_{user_id}',
        {
            'type': 'permissions.updated',
            'event': 'permissions.updated',
            'world_id': world_id,
        },
    )


def _push_permissions_event_for_role(role: WorldRoles) -> None:
    user_ids = (
        WorldUserHasRoles.objects
        .filter(role=role)
        .values_list('user_id', flat=True)
        .distinct()
    )
    for uid in user_ids:
        _push_permissions_event(role.world_id, uid)


class WorldRolesListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Roles"],
        responses={200: WorldRolesSerializer(many=True)},
    )
    def get(self, request: "Request", world_id: int) -> Response:
        world = _get_world(world_id)
        roles = WorldRoles.objects.filter(world=world)
        return Response(WorldRolesSerializer(roles, many=True).data)

    @extend_schema(
        tags=["Roles"],
        request=WorldRolesWriteSerializer,
        responses={201: WorldRolesSerializer, 400: None, 403: None},
    )
    def post(self, request: "Request", world_id: int) -> Response:
        world = _get_world(world_id)
        if not user_has_permission(request.user, world, "manage_roles"):
            return Response(FORBIDDEN, status=status.HTTP_403_FORBIDDEN)

        serializer = WorldRolesWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = cast(dict[str, object], serializer.validated_data)
        name = validated_data.get("name")
        if name is None:
            return Response({"name": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            role = WorldRoles.objects.create(world=world, name=str(name))
            permission_ids = cast(list[int], validated_data.get("permission_ids", []))
            _apply_permissions(role, permission_ids)

        return Response(WorldRolesSerializer(role).data, status=status.HTTP_201_CREATED)


class WorldRolesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Roles"], responses={200: WorldRolesSerializer, 404: None})
    def get(self, request: "Request", world_id: int, role_id: int) -> Response:
        world = _get_world(world_id)
        role = _get_role(world, role_id)
        return Response(WorldRolesSerializer(role).data)

    @extend_schema(
        tags=["Roles"],
        request=WorldRolesWriteSerializer,
        responses={200: WorldRolesSerializer, 400: None, 403: None, 404: None},
    )
    def patch(self, request: "Request", world_id: int, role_id: int) -> Response:
        world = _get_world(world_id)
        if not user_has_permission(request.user, world, "manage_roles"):
            return Response(FORBIDDEN, status=status.HTTP_403_FORBIDDEN)

        role = _get_role(world, role_id)
        serializer = WorldRolesWriteSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = cast(dict[str, object], serializer.validated_data)

        with transaction.atomic():
            if "name" in validated_data:
                role.name = str(validated_data["name"])
                role.save(update_fields=["name", "updated_at"])
            if "permission_ids" in validated_data:
                permission_ids = cast(list[int], validated_data["permission_ids"])
                _apply_permissions(role, permission_ids)
                transaction.on_commit(lambda: _push_permissions_event_for_role(role))

        return Response(WorldRolesSerializer(role).data)

    @extend_schema(tags=["Roles"], responses={204: None, 403: None, 404: None})
    def delete(self, request: "Request", world_id: int, role_id: int) -> Response:
        world = _get_world(world_id)
        if not user_has_permission(request.user, world, "manage_roles"):
            return Response(FORBIDDEN, status=status.HTTP_403_FORBIDDEN)

        role = _get_role(world, role_id)
        if role.is_system:
            return Response({"error": "System roles cannot be deleted."}, status=status.HTTP_403_FORBIDDEN)
        now = timezone.now()
        with transaction.atomic():
            WorldRoleHasPermissions.objects.filter(role=role).update(deleted_at=now)
            WorldUserHasRoles.objects.filter(role=role).update(deleted_at=now)
            role.deleted_at = now
            role.save(update_fields=["deleted_at"])
            transaction.on_commit(lambda: _push_permissions_event_for_role(role))

        return Response(status=status.HTTP_204_NO_CONTENT)


class WorldRolePermissionsCatalogView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Roles"], responses={200: WorldRolePermissionSerializer(many=True)})
    def get(self, request: "Request") -> Response:
        perms = WorldRolePermissions.objects.all()
        return Response(WorldRolePermissionSerializer(perms, many=True).data)


class WorldUserRolesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Roles"], responses={200: None})
    def get(self, request: "Request", world_id: int, user_id: int) -> Response:
        world = _get_world(world_id)
        assignments = WorldUserHasRoles.objects.filter(
            world=world, user_id=user_id
        ).select_related("role")
        data = [
            {"role_id": a.role.id, "role_name": a.role.name}
            for a in assignments
        ]
        return Response(data)

    @extend_schema(tags=["Roles"], responses={201: None, 400: None, 403: None, 404: None})
    def post(self, request: "Request", world_id: int, user_id: int) -> Response:
        world = _get_world(world_id)
        if not user_has_permission(request.user, world, "manage_members"):
            return Response({"error": "You do not have permission to manage members."}, status=status.HTTP_403_FORBIDDEN)

        request_data = cast(dict[str, object], request.data)
        role_id_raw = request_data.get("role_id")
        if role_id_raw is None:
            return Response({"role_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if isinstance(role_id_raw, bool):
            return Response({"role_id": "A valid integer is required."}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(role_id_raw, int):
            role_id = role_id_raw
        elif isinstance(role_id_raw, str):
            try:
                role_id = int(role_id_raw)
            except ValueError:
                return Response({"role_id": "A valid integer is required."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"role_id": "A valid integer is required."}, status=status.HTTP_400_BAD_REQUEST)

        role = _get_role(world, role_id)
        target_user = get_object_or_404(User, id=user_id)

        active = WorldUserHasRoles.objects.filter(
            world=world, user=target_user, role=role
        ).first()
        if not active:
            WorldUserHasRoles.objects.create(world=world, user=target_user, role=role)
            transaction.on_commit(lambda: _push_permissions_event(world_id, user_id))

        return Response({"role_id": role.id, "role_name": role.name}, status=status.HTTP_201_CREATED)


class WorldUserRoleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Roles"], responses={204: None, 403: None, 404: None})
    def delete(self, request: "Request", world_id: int, user_id: int, role_id: int) -> Response:
        world = _get_world(world_id)
        if not user_has_permission(request.user, world, "manage_members"):
            return Response({"error": "You do not have permission to manage members."}, status=status.HTTP_403_FORBIDDEN)

        assignment = get_object_or_404(
            WorldUserHasRoles, world=world, user_id=user_id, role_id=role_id
        )
        assignment.deleted_at = timezone.now()
        assignment.save(update_fields=["deleted_at"])
        transaction.on_commit(lambda: _push_permissions_event(world_id, user_id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Roles"], responses={200: None})
    def get(self, request: "Request", world_id: int) -> Response:
        world = _get_world(world_id)
        if world.owner_id == request.user.id:
            perms = list(WorldRolePermissions.objects.values_list("name", flat=True))
        else:
            perms = list(
                WorldRoleHasPermissions.objects
                .filter(
                    role__worlduserhasroles__user=request.user,
                    role__worlduserhasroles__world=world,
                )
                .values_list("permission__name", flat=True)
                .distinct()
            )
        return Response({"permissions": perms})
