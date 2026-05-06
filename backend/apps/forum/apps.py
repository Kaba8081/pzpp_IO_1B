from django.apps import AppConfig

class ForumConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.forum'
    verbose_name = 'Forum Management'

    def ready(self):
        import apps.forum.world_room_messages.signals  # noqa: F401
        import apps.forum.world_user_profiles.signals  # noqa: F401
