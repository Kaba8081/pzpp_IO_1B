from apps.forum.worlds.models import Worlds
from apps.forum.world_role_has_permissions.models import WorldRoleHasPermissions
from apps.forum.world_role_permissions.models import WorldRolePermissions


def user_has_permission(user, world: Worlds, perm_name: str) -> bool:
    if world.owner.id == user.id:
        return True

    try:
        perm = WorldRolePermissions.objects.get(name=perm_name)
    except WorldRolePermissions.DoesNotExist:
        return False

    return WorldRoleHasPermissions.objects.filter(
        permission=perm,
        role__worlduserhasroles__user=user,
        role__worlduserhasroles__world=world,
    ).exists()
