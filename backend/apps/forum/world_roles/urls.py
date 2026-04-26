from django.urls import path

from apps.forum.world_roles.views import (
    WorldRolesListView,
    WorldRolesDetailView,
    WorldRolePermissionsCatalogView,
    WorldUserRolesView,
    WorldUserRoleDetailView,
)

app_name = "world_roles"

urlpatterns = [
    path("permissions/", WorldRolePermissionsCatalogView.as_view(), name="permissions-catalog"),
    path("<int:world_id>/roles/", WorldRolesListView.as_view(), name="roles-list"),
    path("<int:world_id>/roles/<int:role_id>/", WorldRolesDetailView.as_view(), name="roles-detail"),
    path("<int:world_id>/members/<int:user_id>/roles/", WorldUserRolesView.as_view(), name="user-roles"),
    path("<int:world_id>/members/<int:user_id>/roles/<int:role_id>/", WorldUserRoleDetailView.as_view(), name="user-role-detail"),
]
