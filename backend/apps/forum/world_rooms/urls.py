from django.urls import path
from apps.forum.world_rooms.views import WorldRoomsListView

app_name = 'world_rooms'

urlpatterns = [
    path('', WorldRoomsListView.as_view(), name='channel-list'),
]
