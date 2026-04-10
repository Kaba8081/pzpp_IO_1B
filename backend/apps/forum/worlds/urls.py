from django.urls import path

from apps.forum.worlds.views import WorldView, WorldDetailView

app_name = 'worlds'

urlpatterns = [
    path('', WorldView.as_view(), name='worlds'),
    path('<int:world_id>', WorldDetailView.as_view(), name='world-detail'),
]
