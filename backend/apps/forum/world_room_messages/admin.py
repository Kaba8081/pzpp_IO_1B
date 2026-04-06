from django.contrib import admin

from apps.forum.models import WorldRoomMessages

@admin.register(WorldRoomMessages)
class WorldRoomMessagesAdmin(admin.ModelAdmin):
    list_display = ("id", "get_user_name", "get_room_name")
    search_fields = ("user_profile__name", "user_profile__user__email", "room__name")
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ("user_profile", "room")

    @admin.display(ordering="room__name", description="World")
    def get_room_name(self, obj: WorldRoomMessages) -> str:
        if obj.room:
            return obj.room.name

        return "No world"

    @admin.display(ordering="user_profile__name", description="Username")
    def get_user_name(self, obj: WorldRoomMessages) -> str:
        if not obj.user_profile:
            return "No user"

        return obj.user_profile.name
