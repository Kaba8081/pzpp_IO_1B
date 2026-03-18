from rest_framework import serializers

from apps.forum.world_role_has_permissions.models import WorldRolePermissions

class WorldRoleHasPermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldRolePermissions
        fields = '__all__'