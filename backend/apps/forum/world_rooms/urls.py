from django.urls import path
from apps.forum.world_room_messages.views import ChannelMessagesView
from apps.forum.world_rooms.views import WorldRoomsDetailView, WorldRoomThumbnailView

app_name = 'world_rooms'

urlpatterns = [
    path('<int:channel_id>', WorldRoomsDetailView.as_view(), name='room-detail'),
    path('<int:channel_id>/messages', ChannelMessagesView.as_view(), name='room-messages'),
    path('<int:room_id>', WorldRoomsDetailView.as_view(), name='room-detail'),
    path('<int:room_id>/image', WorldRoomThumbnailView.as_view(), name='room-thumbnail')
]
