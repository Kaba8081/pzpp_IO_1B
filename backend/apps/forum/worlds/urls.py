from django.urls import path

from apps.forum.worlds.views import WorldView
from apps.forum.world_user_profiles.views import WorldProfilesByWorldView

app_name = 'worlds'

urlpatterns = [
    path('', WorldView.as_view(), name='worlds'),
    path('<int:world_id>/profiles', WorldProfilesByWorldView.as_view(), name='world-profiles'),
]
