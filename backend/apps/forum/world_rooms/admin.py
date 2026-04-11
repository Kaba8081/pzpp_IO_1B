from django.contrib import admin

from apps.forum.models import WorldRooms

@admin.register(WorldRooms)
class WorldRoomsAdmin(admin.ModelAdmin):
    list_display = ("id", "get_world_name", "name")
    search_fields = ("world__name", "name")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("world", )

    @admin.display(ordering="world__name", description="World")
    def get_world_name(self, obj: WorldRooms) -> str:
        if obj.world:
            return obj.world.name

        return "No world"
