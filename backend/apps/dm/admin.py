from django.contrib import admin

from apps.dm.models import DirectMessageThread, DirectMessages


@admin.register(DirectMessageThread)
class DirectMessageThreadAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_a', 'user_b', 'created_at']
    raw_id_fields = ['user_a', 'user_b']


@admin.register(DirectMessages)
class DirectMessagesAdmin(admin.ModelAdmin):
    list_display = ['id', 'thread', 'sender', 'content', 'created_at']
    raw_id_fields = ['thread', 'sender']
