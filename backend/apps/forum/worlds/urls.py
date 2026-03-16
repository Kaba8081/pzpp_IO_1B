from django.urls import path

from apps.forum.worlds.views import WorldView

app_name = 'worlds'

urlpatterns = [
    path('', WorldView.as_view(), name='worlds'),
]
