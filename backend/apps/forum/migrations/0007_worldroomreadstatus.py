from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0006_worldroles_is_system'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WorldRoomReadStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('last_read_message_id', models.BigIntegerField(blank=True, null=True)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='read_statuses', to='forum.worldrooms')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_read_statuses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'room')},
            },
        ),
    ]
