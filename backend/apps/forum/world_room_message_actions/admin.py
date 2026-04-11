from django.contrib import admin

from apps.forum.models import WorldRoomMessageActions

@admin.register(WorldRoomMessageActions)
class WorldRoomMessageActionsAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "get_world_rule_name", "get_user_name", "value")
    search_fields = ("world_rule__name", "user_profile__name")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("message", "world_rule", "user_profile")

    @admin.display(ordering="world_rule__name", description="World Rule")
    def get_world_rule_name(self, obj: WorldRoomMessageActions) -> str:
        if not obj.world_rule:
            return "No rule"

        return obj.world_rule.stat_slug

    @admin.display(ordering="user_profile__name", description="Username")
    def get_user_name(self, obj: WorldRoomMessageActions) -> str:
        if not obj.user_profile:
            return "No user"

        return obj.user_profile.name
