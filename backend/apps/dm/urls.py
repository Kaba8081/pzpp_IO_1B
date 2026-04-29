from django.urls import path

from apps.dm.views import DMThreadListView, DMThreadWithUserView, DMThreadDetailView, DMMessageListView, DMMarkReadView

app_name = 'dm'

urlpatterns = [
    path('dm/threads/', DMThreadListView.as_view(), name='dm-thread-list'),
    path('dm/thread/with/<int:user_id>/', DMThreadWithUserView.as_view(), name='dm-thread-with-user'),
    path('dm/thread/<int:thread_id>/', DMThreadDetailView.as_view(), name='dm-thread-detail'),
    path('dm/thread/<int:thread_id>/messages/', DMMessageListView.as_view(), name='dm-messages'),
    path('dm/thread/<int:thread_id>/mark-read/', DMMarkReadView.as_view(), name='dm-mark-read'),
]
