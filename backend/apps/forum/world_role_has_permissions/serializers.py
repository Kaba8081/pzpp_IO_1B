from rest_framework import serializers

from apps.forum.world_role_has_permissions.models import WorldRoleHasPermissions

class WorldRoleHasPermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorldRoleHasPermissions
        fields = '__all__'