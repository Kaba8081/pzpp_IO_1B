from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("forum", "0005_seed_role_permissions"),
    ]

    operations = [
        migrations.AddField(
            model_name="worldroles",
            name="is_system",
            field=models.BooleanField(default=False),
        ),
    ]
