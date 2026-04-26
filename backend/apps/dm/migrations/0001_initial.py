import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DirectMessageThread',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(default=None, null=True)),
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('user_a', models.ForeignKey(
                    on_delete=django.db.models.deletion.DO_NOTHING,
                    related_name='dm_threads_as_a',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('user_b', models.ForeignKey(
                    on_delete=django.db.models.deletion.DO_NOTHING,
                    related_name='dm_threads_as_b',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'unique_together': {('user_a', 'user_b')},
            },
        ),
        migrations.CreateModel(
            name='DirectMessages',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(default=None, null=True)),
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('content', models.CharField(max_length=2048)),
                ('thread', models.ForeignKey(
                    on_delete=django.db.models.deletion.DO_NOTHING,
                    related_name='messages',
                    to='dm.directmessagethread',
                )),
                ('sender', models.ForeignKey(
                    on_delete=django.db.models.deletion.DO_NOTHING,
                    related_name='sent_dms',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['created_at'],
                'abstract': False,
            },
        ),
    ]
