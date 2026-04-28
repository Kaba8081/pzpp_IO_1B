import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0008_worldroommessages_message_type_and_subtypes'),
    ]

    operations = [
        migrations.AddField(
            model_name='worldroomsystemmessage',
            name='user_profile',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='system_messages',
                to='forum.worlduserprofiles',
            ),
        ),
    ]
