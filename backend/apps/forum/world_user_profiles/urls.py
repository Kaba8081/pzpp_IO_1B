from django.urls import path

from apps.forum.world_user_profiles.views import ProfileView, AllProfilesView, ProfileAvatarView, WorldMembersView

app_name = 'profiles'

urlpatterns = [
    path('', AllProfilesView.as_view(), name='all-profiles'),
    path('world/<int:world_id>/members', WorldMembersView.as_view(), name='world-members'),
    path('<int:profile_id>', ProfileView.as_view(), name='single-profile'),
    path('<int:profile_id>/image', ProfileAvatarView.as_view(), name='world-profile-avatar')
]
