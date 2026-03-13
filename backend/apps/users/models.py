from datetime import datetime
from typing import TYPE_CHECKING

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from common.models import BaseModel

class UserManager(BaseUserManager):
    def create_user(
        self,
        email: str,
        password: str,
        **extra_fields
    ):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(
        self,
        email: str,
        password: str,
        **extra_fields
    ):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(
            email,
            password,
            **extra_fields
        )

class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    if TYPE_CHECKING:
        id: int | None
        password: str
        last_login: datetime | None
        is_superuser: bool
        created_at: datetime
        updated_at: datetime
        deleted_at: datetime | None

    
    email = models.EmailField(unique=True, db_index=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    def __str__(self) -> str:
        return str(self.email)
    
class UserProfile(BaseModel):
    id = models.BigAutoField(primary_key=True)
    userId = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    username = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=255)
    profilePicture = models.ImageField(null=True, blank=True)