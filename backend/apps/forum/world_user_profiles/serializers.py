from rest_framework import serializers

from apps.forum.world_user_profiles.models import WorldUserProfiles

class WorldUserProfilesSerializer(serializers.ModelSerializer):
    world = serializers.IntegerField(read_only=True, source='world_id')
    user = serializers.IntegerField(read_only=True, source='user_id')

    class Meta:
        model = WorldUserProfiles
        fields = '__all__'
