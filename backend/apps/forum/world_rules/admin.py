from django.contrib import admin

from apps.forum.models import WorldRules

@admin.register(WorldRules)
class WorldRulesAdmin(admin.ModelAdmin):
    list_display = ("id", "get_world_name", "stat_slug", "type", "is_required")
    search_fields = ("world__name", "stat_slug")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("world", )

    @admin.display(ordering="world__name", description="World")
    def get_world_name(self, obj: WorldRules) -> str:
        if obj.world:
            return obj.world.name

        return "No world"
