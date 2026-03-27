from rest_framework import serializers

from apps.forum.world_roles.models import WorldRoles

class WorldRolesSerializer(serializers.ModelSerializer):
    world = serializers.IntegerField(read_only=True, source='world_id')

    class Meta:
        model = WorldRoles
        fields = '__all__'