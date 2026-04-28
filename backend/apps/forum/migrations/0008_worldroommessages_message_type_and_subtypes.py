import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0007_worldroomreadstatus'),
    ]

    operations = [
        migrations.AlterField(
            model_name='worldroommessages',
            name='content',
            field=models.TextField(blank=True, max_length=1024, null=True),
        ),
        migrations.AlterField(
            model_name='worldroommessages',
            name='user_profile',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to='forum.worlduserprofiles',
            ),
        ),
        migrations.AddField(
            model_name='worldroommessages',
            name='message_type',
            field=models.CharField(
                choices=[('text', 'Text'), ('media', 'Media'), ('system', 'System')],
                default='text',
                max_length=16,
            ),
        ),
        migrations.CreateModel(
            name='WorldRoomMediaMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(default=None, null=True)),
                ('file', models.FileField(upload_to='room_media/')),
                ('media_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video')], max_length=8)),
                ('message', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='media_message',
                    to='forum.worldroommessages',
                )),
            ],
            options={
                'verbose_name': 'Room Media Message',
                'verbose_name_plural': 'Room Media Messages',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='WorldRoomSystemMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(default=None, null=True)),
                ('event_type', models.CharField(
                    choices=[('user_joined', 'User Joined'), ('user_left', 'User Left')],
                    max_length=32,
                )),
                ('message', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='system_message',
                    to='forum.worldroommessages',
                )),
            ],
            options={
                'verbose_name': 'Room System Message',
                'verbose_name_plural': 'Room System Messages',
                'abstract': False,
            },
        ),
    ]
