from django.urls import path, include
from .views import (
    RegisterView,
    LoginView,
    MeApi
)

app_name = 'users'

urlpatterns = [
    path('auth/', include(([
        path('register/', RegisterView.as_view(), name='register'),
        path('login/', LoginView.as_view(), name='login')
        path('me/', MeApi.as_view(), name='me'),
    ], app_name))),
]
