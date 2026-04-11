from django.urls import include, path

app_name = 'forum'

urlpatterns = [
    path('forum/world/', include('apps.forum.worlds.urls')),
    path('forum/profile/', include('apps.forum.world_user_profiles.urls')),
]
