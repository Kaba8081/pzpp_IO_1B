from django.urls import path

from apps.forum.worlds.views import WorldView, WorldDetailView
from apps.forum.world_user_profiles.views import WorldProfilesByWorldView
from apps.forum.world_rooms.views import WorldRoomsListView

app_name = 'worlds'

urlpatterns = [
    path('', WorldView.as_view(), name='worlds'),
    path('<int:world_id>/profiles', WorldProfilesByWorldView.as_view(), name='world-profiles'),
    path('<int:world_id>', WorldDetailView.as_view(), name='world-detail'),
    path('<int:world_id>/channels', WorldRoomsListView.as_view(), name='world-channels'),
]
