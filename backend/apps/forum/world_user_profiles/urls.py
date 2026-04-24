from django.urls import path

from apps.forum.world_user_profiles.views import ProfileView, AllProfilesView, ProfileAvatarView

app_name = 'profiles'

urlpatterns = [
    path('', AllProfilesView.as_view(), name='all-profiles'),
    path('<int:profile_id>', ProfileView.as_view(), name='single-profile'),
    path('<int:profile_id>/image', ProfileAvatarView.as_view(), name='world-profile-avatar')
]
