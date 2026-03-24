from rest_framework import serializers

from apps.forum.world_user_has_roles.models import WorldUserHasRoles

class WorldUserHasRolesSerializer(serializers.ModelSerializer):
    world_id = serializers.IntegerField(read_only=True, source='world_id_id')
    user_id = serializers.IntegerField(read_only=True, source='user_id_id')
    role_id = serializers.IntegerField(read_only=True, source='role_id_id')

    class Meta:
        model = WorldUserHasRoles
        fields = '__all__'