from rest_framework import serializers

from apps.forum.world_rules.models import WorldRules

class WorldRuleSerializer(serializers.ModelSerializer):
	class Meta:
		model = WorldRules
		fields = '__all__'
    