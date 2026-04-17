from django.urls import path
from apps.forum.world_room_messages.views import MessageDetailView

app_name = 'world_room_messages'

urlpatterns = [
    path('<int:message_id>', MessageDetailView.as_view(), name='message-detail'),
]
