from django.urls import path
from apps.forum.world_rooms.views import WorldRoomsDetailView

app_name = 'world_rooms'

urlpatterns = [
    path('<int:channel_id>', WorldRoomsDetailView.as_view(), name='room-detail'),
]
