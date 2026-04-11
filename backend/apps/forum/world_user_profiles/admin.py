from django.contrib import admin

from apps.forum.models import WorldUserProfiles

@admin.register(WorldUserProfiles)
class WorldUserProfilesAdmin(admin.ModelAdmin):
    list_display = ("id", "get_world_name", "get_user_name", "name")
    search_fields = ("world__name", "user__userprofile__username", "name")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("world", "user")

    @admin.display(ordering="world__name", description="World")
    def get_world_name(self, obj: WorldUserProfiles) -> str:
        if obj.world:
            return obj.world.name

        return "No world"

    @admin.display(ordering="user__userprofile__username", description="Username")
    def get_user_name(self, obj: WorldUserProfiles) -> str:
        if not obj.user:
            return "No user"

        user_profile = obj.user.userprofile_set.first() # type: ignore
        if not user_profile:
            return obj.user.email

        return user_profile.username
