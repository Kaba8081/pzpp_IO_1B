from django.urls import path

from .views import LoginApi, MeApi

app_name = 'users'

urlpatterns = [
    path('login/', LoginApi.as_view(), name='login'),
    path('', MeApi.as_view(), name='me'),
]
