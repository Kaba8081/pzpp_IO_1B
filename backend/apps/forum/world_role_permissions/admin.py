from django.contrib import admin

from apps.forum.models import WorldRolePermissions

@admin.register(WorldRolePermissions)
class WorldRolePermissionsAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name", )
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
