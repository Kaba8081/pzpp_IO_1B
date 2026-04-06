from django.urls import path

from apps.forum.world_user_profiles.views import ProfileView, AllProfilesView

app_name = 'profiles'

urlpatterns = [
    path('', AllProfilesView.as_view(), name='all-profiles'),
    path('<int:profile_id>', ProfileView.as_view(), name='single-profile'),
]
