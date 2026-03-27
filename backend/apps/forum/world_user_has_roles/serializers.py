from rest_framework import serializers

from apps.forum.world_user_has_roles.models import WorldUserHasRoles

class WorldUserHasRolesSerializer(serializers.ModelSerializer):
    world = serializers.IntegerField(read_only=True, source='world_id')
    user = serializers.IntegerField(read_only=True, source='user_id')
    role = serializers.IntegerField(read_only=True, source='role_id')

    class Meta:
        model = WorldUserHasRoles
        fields = '__all__'
