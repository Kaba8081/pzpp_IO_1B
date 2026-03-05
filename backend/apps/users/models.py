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
    email = models.EmailField(unique=True, db_index=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self) -> str:
        return str(self.email)

class UserProfile(BaseModel):
    userId = models.BigAutoField
    username = models.CharField(max_length=64)
    description = models.CharField(max_length=255)
    profilePicture = models.ImageField