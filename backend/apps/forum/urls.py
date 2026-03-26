from django.urls import include, path

app_name = 'forum'

urlpatterns = [
    path('forum/world/', include('apps.forum.worlds.urls')),
]
