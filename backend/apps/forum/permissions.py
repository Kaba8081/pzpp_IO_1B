from apps.forum.worlds.models import Worlds
from apps.forum.world_user_has_roles.models import WorldUserHasRoles
from apps.forum.world_role_has_permissions.models import WorldRoleHasPermissions
from apps.forum.world_role_permissions.models import WorldRolePermissions


def user_has_permission(user, world: Worlds, perm_name: str) -> bool:
    if world.owner_id == user.id:
        return True

    try:
        perm = WorldRolePermissions.objects.get(name=perm_name)
    except WorldRolePermissions.DoesNotExist:
        return False

    return WorldRoleHasPermissions.objects.filter(
        deleted_at__isnull=True,
        permission=perm,
        role__worlduserhasroles__user=user,
        role__worlduserhasroles__world=world,
        role__worlduserhasroles__deleted_at__isnull=True,
        role__deleted_at__isnull=True,
    ).exists()
