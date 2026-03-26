from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import User, UserProfile

class CustomUserCreationForm(UserCreationForm):
    class Meta():
        model = User
        fields = ('email',)

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    model = User

    list_display = (
        'id',
        'email',
        'is_active',
        'is_staff',
        'is_superuser',
        'created_at',
        'updated_at',
    )
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('email',)
    ordering = ('id',)
    readonly_fields = ('created_at', 'updated_at', 'deleted_at', 'last_login')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (
            'Permissions',
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                )
            },
        ),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at', 'deleted_at')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'password1', 'password2', 'is_active', 'is_staff'),
            },
        ),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'username', 'created_at', 'updated_at', 'deleted_at')
    search_fields = ('username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    autocomplete_fields = ('user',)
