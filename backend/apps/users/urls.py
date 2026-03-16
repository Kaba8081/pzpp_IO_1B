from django.urls import path, include

from .views import (
    RegisterView,
    LoginView
)

app_name = 'users'

urlpatterns = [
    path('auth/', include(([
        path('register/', RegisterView.as_view(), name='register'),
        path('login/', LoginView.as_view(), name='login')
    ], app_name))),
]
