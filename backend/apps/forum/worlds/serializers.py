from rest_framework import serializers

from apps.forum.worlds.models import Worlds

class WorldSerializer(serializers.ModelSerializer):

    owner = serializers.IntegerField(read_only=True, source='owner_id')
    distinct_user_count = serializers.SerializerMethodField()
    total_user_profiles_count = serializers.SerializerMethodField()

    def get_distinct_user_count(self, obj: Worlds):
        return obj.worlduserprofiles_set.values('user').distinct().count() if hasattr(obj, 'worlduserprofiles_set') else 0 # pyright: ignore[reportAttributeAccessIssue]

    def get_total_user_profiles_count(self, obj: Worlds):
        return obj.worlduserprofiles_set.count() if hasattr(obj, 'worlduserprofiles_set') else 0 # pyright: ignore[reportAttributeAccessIssue]

    class Meta:
        model = Worlds
        fields = [
            'id',
            'name',
            'description',
            'owner',
            'profile_picture',
            'distinct_user_count',
            'total_user_profiles_count',
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
        request = self.context.get('request')
        owner = None
        if request and hasattr(request, 'user') and request.user and not request.user.is_anonymous:
            owner = request.user
        if owner is None:
            raise serializers.ValidationError({'owner': 'Owner is required to create a world.'})
        world = Worlds.objects.create(owner=owner, **validated_data)
        return world

