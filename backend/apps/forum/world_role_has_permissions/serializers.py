from rest_framework import serializers

from apps.forum.world_role_has_permissions.models import WorldRoleHasPermissions

class WorldRoleHasPermissionsSerializer(serializers.ModelSerializer):
    role = serializers.IntegerField(read_only=True, source='rule_id')
    permission = serializers.IntegerField(read_only=True, source='permission_id')

    class Meta:
        model = WorldRoleHasPermissions
        fields = '__all__'
