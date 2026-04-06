from django.contrib import admin

from apps.forum.models import WorldRoleHasPermissions

@admin.register(WorldRoleHasPermissions)
class WorldRoleHasPermissionsAdmin(admin.ModelAdmin):
    list_display = ("get_role_name", "get_permission_name")
    search_fields = ("role__name", "permission__name")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("role", "permission")

    @admin.display(ordering="role__name", description="Role")
    def get_role_name(self, obj: WorldRoleHasPermissions) -> str:
        if obj.role:
            return obj.role.name

        return "No role"

    @admin.display(ordering="permission__name", description="Permission")
    def get_permission_name(self, obj: WorldRoleHasPermissions) -> str:
        if obj.permission:
            return obj.permission.name

        return "No permission"
