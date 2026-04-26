from rest_framework import serializers

from apps.forum.world_roles.models import WorldRoles
from apps.forum.world_role_permissions.models import WorldRolePermissions
from apps.forum.world_role_has_permissions.models import WorldRoleHasPermissions


class WorldRolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldRolePermissions
        fields = ["id", "name", "created_at", "updated_at"]


class WorldRolesSerializer(serializers.ModelSerializer):
    world_id = serializers.IntegerField(read_only=True)
    permission_ids = serializers.SerializerMethodField()

    class Meta:
        model = WorldRoles
        fields = ["id", "world_id", "name", "is_system", "permission_ids", "created_at", "updated_at"]
        read_only_fields = ["id", "world_id", "is_system", "created_at", "updated_at"]

    def get_permission_ids(self, obj):
        return list(
            WorldRoleHasPermissions.objects.filter(role=obj)
            .values_list("permission_id", flat=True)
        )


class WorldRolesWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=64)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )

    def validate_permission_ids(self, value):
        if not value:
            return value
        existing = set(
            WorldRolePermissions.objects.filter(id__in=value).values_list("id", flat=True)
        )
        invalid = set(value) - existing
        if invalid:
            raise serializers.ValidationError(f"Invalid permission IDs: {sorted(invalid)}")
        return value
