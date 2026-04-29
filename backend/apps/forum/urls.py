from django.urls import include, path

app_name = 'forum'

urlpatterns = [
    path('forum/world/', include('apps.forum.worlds.urls')),
    path('forum/profile/', include('apps.forum.world_user_profiles.urls')),
    path('forum/channel/', include('apps.forum.world_rooms.urls')),
    path('forum/message/', include('apps.forum.world_room_messages.urls')),
    path('forum/world/', include('apps.forum.world_roles.urls')),
]
