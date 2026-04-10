from rest_framework import serializers

from apps.forum.worlds.models import Worlds

class WorldSerializer(serializers.ModelSerializer):
    owner = serializers.IntegerField(read_only=True, source='owner_id')

    class Meta:
        model = Worlds
        fields = [
            'id',
            'name',
            'description',
            'owner',
            'profile_picture',
        ]

    def validate(self, attrs):
        name = attrs.get('name', '').strip()
        if not name:
            raise serializers.ValidationError({'name': 'Name is required and cannot be blank.'})
        attrs['name'] = name

        if len(name) > 255:
            raise serializers.ValidationError({'name': 'Name must be at most 255 characters.'})

        description = attrs.get('description', '')
        if description is not None and len(description.strip()) == 0:
            attrs['description'] = ''

        owner = None
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user and not request.user.is_anonymous:
            owner = request.user

        if owner:
            if Worlds.objects.filter(owner=owner, name__iexact=name).exists():
                raise serializers.ValidationError({'name': 'You already have a world with this name.'})

        return attrs

    def create(self, validated_data):
        owner = validated_data.pop('owner_id', None) or validated_data.pop('owner', None)
        if owner is None:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user and not request.user.is_anonymous:
                owner = request.user

        if owner is None:
            raise serializers.ValidationError({'owner': 'Owner is required to create a world.'})

        world = Worlds.objects.create(owner=owner, **validated_data)
        return world

