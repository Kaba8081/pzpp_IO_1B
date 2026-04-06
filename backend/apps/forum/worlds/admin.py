from django.contrib import admin

from apps.forum.models import Worlds

@admin.register(Worlds)
class WorldsAdmin(admin.ModelAdmin):
    list_display = ("id", "get_owner_name","name")
    search_fields = ("name", )
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ('owner',)

    @admin.display(ordering='owner__userprofile__username', description='Owner')
    def get_owner_name(self, obj: Worlds) -> str:
        if obj.owner:
            user_profile = obj.owner.userprofile_set.first()
            if user_profile:
                return user_profile.username
        return obj.owner.email if obj.owner else "No Owner"
