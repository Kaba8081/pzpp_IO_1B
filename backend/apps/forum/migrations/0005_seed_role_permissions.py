from django.db import migrations


PERMISSIONS = [
    "manage_world",
    "manage_channels",
    "manage_roles",
    "manage_messages",
    "manage_members",
    "send_messages",
]


def seed_permissions(apps, schema_editor):
    WorldRolePermissions = apps.get_model("forum", "WorldRolePermissions")
    for name in PERMISSIONS:
        WorldRolePermissions.objects.update_or_create(name=name)


def reverse_permissions(apps, schema_editor):
    WorldRolePermissions = apps.get_model("forum", "WorldRolePermissions")
    WorldRolePermissions.objects.filter(name__in=PERMISSIONS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("forum", "0004_worldrooms_thumbnail_worlduserprofiles_avatar"),
    ]

    operations = [
        migrations.RunPython(seed_permissions, reverse_permissions),
    ]
