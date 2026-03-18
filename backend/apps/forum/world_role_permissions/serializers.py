from rest_framework import serializers

from apps.forum.world_role_permissions.models import WorldRolePermissions

class WorldRolePermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldRolePermissions
        fields = '__all__'