from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('dm', '0002_directmessagereadstatus'),
    ]

    operations = [
        migrations.AlterField(
            model_name='directmessages',
            name='content',
            field=models.CharField(blank=True, max_length=2048, null=True),
        ),
        migrations.CreateModel(
            name='DirectMessageMediaMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('file', models.FileField(upload_to='dm_media/')),
                ('media_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video')], max_length=8)),
                ('message', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='media_message', to='dm.directmessages')),
            ],
            options={
                'verbose_name': 'DM Media Message',
                'verbose_name_plural': 'DM Media Messages',
            },
        ),
    ]
