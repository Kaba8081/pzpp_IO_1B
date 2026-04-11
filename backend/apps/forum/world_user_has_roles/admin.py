from django.contrib import admin

from apps.forum.models import WorldUserHasRoles

@admin.register(WorldUserHasRoles)
class WorldUserHasRolesAdmin(admin.ModelAdmin):
    list_display = ("get_world_name", "get_user_name", "get_role_name")
    search_fields = ("world__name", "user__userprofile__username", "role__name")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("world", "user", "role")

    @admin.display(ordering="world__name", description="World")
    def get_world_name(self, obj: WorldUserHasRoles) -> str:
        if obj.world:
            return obj.world.name

        return "No world"

    @admin.display(ordering="user__userprofile__username", description="Username")
    def get_user_name(self, obj: WorldUserHasRoles) -> str:
        if not obj.user:
            return "No user"

        user_profile = obj.user.userprofile_set.first() # type: ignore
        if not user_profile:
            return obj.user.email

        return user_profile.username

    @admin.display(ordering="role__name", description="Role")
    def get_role_name(self, obj: WorldUserHasRoles) -> str:
        if obj.role:
            return obj.role.name

        return "No role"
