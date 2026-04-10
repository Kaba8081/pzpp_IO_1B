from django.urls import path
from apps.forum.world_rooms.views import WorldRoomsDetailView

app_name = 'world_rooms_detail'

urlpatterns = [
    path('<int:channel_id>', WorldRoomsDetailView.as_view(), name='channel-detail'),
]
