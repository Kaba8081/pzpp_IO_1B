from django.urls import path, include
from .views import (
    RegisterView,
    LoginView,
    MeView,
    UserProfileDetailView,
    UserProfileByIdView,
    RefreshTokenView,
    UserUnreadView,
    UserAvatarView
)

app_name = 'users'

urlpatterns = [
    path('auth/', include(([
        path('register/', RegisterView.as_view(), name='register'),
        path('login/', LoginView.as_view(), name='login'),
        path('me/', MeView.as_view(), name='me'),
        path('refresh/', RefreshTokenView.as_view(), name='refresh')
    ], app_name))),
    path('user/id/<int:user_id>/', UserProfileByIdView.as_view(), name='user_profile_by_id'),
    path('user/unread/', UserUnreadView.as_view(), name='user_unread'),
    path('user/<str:username>', UserProfileDetailView.as_view(), name='user_profile_detail'),
    path('user/<str:username>/image', UserAvatarView.as_view(), name="user_profile_image"),
]
