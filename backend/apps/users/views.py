from typing import TYPE_CHECKING

from django.db import transaction, DEFAULT_DB_ALIAS
from django.utils import timezone
from django.contrib.admin.utils import NestedObjects
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, serializers, status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import RegisterSerializer, UserSerializer, UserProfileSerializer
from .models import UserProfile

class UserProfileByIdView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        description="Return the user profile for the given user ID.",
        tags=['User'],
        responses={
            200: UserProfileSerializer,
            404: OpenApiResponse(description="Profile not found."),
        }
    )
    def get(self, request: "Request", user_id: int) -> Response:
        profile = UserProfile.objects.filter(user_id=user_id).first()
        if profile is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)

if TYPE_CHECKING:
    from rest_framework.request import Request

VALIDATION_ERROR_RESPONSE = OpenApiResponse(
    description="Validation errors keyed by field name."
)
TOKEN_OBTAIN_PAIR_REQUEST = inline_serializer(
    name="TokenObtainPairRequest",
    fields={
        "email": serializers.EmailField(),
        "password": serializers.CharField(write_only=True),
    },
)
TOKEN_OBTAIN_PAIR_RESPONSE = inline_serializer(
    name="TokenObtainPairResponse",
    fields={
        "access": serializers.CharField(),
        "refresh": serializers.CharField(),
    },
)
TOKEN_REFRESH_RESPONSE = inline_serializer(
    name="TokenRefreshResponse",
    fields={
        "access": serializers.CharField(),
    },
)
TOKEN_REFRESH_UNAUTHENTICATED_RESPONSE = inline_serializer(
    name="TokenRefreshUnauthenticatedResponse",
    fields={
        "detail": serializers.CharField(),
    },
)

class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: UserSerializer,
            400: VALIDATION_ERROR_RESPONSE
        },
        description="Registers a new user and creates an associated profile.",
        tags=['Auth']
    )
    def post(self, request: "Request") -> Response:
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class LoginView(TokenObtainPairView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        description="Exchange email and password for access and refresh tokens.",
        tags=['Auth'],
        request=TOKEN_OBTAIN_PAIR_REQUEST,
        responses={
            200: OpenApiResponse(
                response=TOKEN_OBTAIN_PAIR_RESPONSE,
                description="Returns access and refresh tokens.",
            ),
            400: VALIDATION_ERROR_RESPONSE,
        }
    )
    def post(self, request: "Request", *args, **kwargs) -> Response:
        return super().post(request, *args, **kwargs)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        description="Get the authenticated user's details.",
        tags=['Auth'],
        responses={
            200: UserSerializer,
            401: OpenApiResponse(description="Authentication credentials were not provided or are invalid."),
        }
    )
    def get(
        self,
        request: "Request"
    ) -> "Response":
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

class UserProfileDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [permissions.AllowAny()]

    @extend_schema(
        description="Return the given user's profile",
        tags=['User'],
        responses={
            200: UserProfileSerializer,
            404: OpenApiResponse(description="Profile not found."),
        }
    )
    def get(self, request: "Request", username: str) -> Response:
        profile = UserProfile.objects.filter(username=username).first()
        if profile is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)

    @extend_schema(
        description="Handle user profile updates",
        tags=['User'],
        request=UserProfileSerializer,
        responses={
            200: UserProfileSerializer,
            400: VALIDATION_ERROR_RESPONSE,
            403: OpenApiResponse(description="You do not have permission to patch this profile."),
            404: OpenApiResponse(description="Profile not found."),
        }
    )
    def patch(self, request: "Request", username: str) -> Response:
        profile = UserProfile.objects.filter(username=username).first()
        if not profile:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if profile.user != request.user:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Handle the deletion of all user related objects by marking them as deleted with a timestamp",
        tags=['User'],
        responses={
            204: OpenApiResponse(description="User deleted successfully."),
            403: OpenApiResponse(description="You do not have permission to delete this user."),
            404: OpenApiResponse(description="User not found."),
        }
    )
    def delete(self, request: "Request", username: str) -> Response:
        profile = UserProfile.objects.filter(username=username).first()
        if not profile:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if profile.user != request.user:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        user = profile.user
        
        # Traverse all relations holding an instance to the user or objects holding instances to the user
        with transaction.atomic():
            # Deactivate account so existing access tokens are no longer accepted.
            if user.is_active:
                user.is_active = False
                user.save(update_fields=['is_active'])

            # Revoke all refresh tokens issued for this user.
            outstanding_tokens = OutstandingToken.objects.select_for_update().filter(user=user)
            for token in outstanding_tokens:
                BlacklistedToken.objects.get_or_create(token=token)

            collector = NestedObjects(using=DEFAULT_DB_ALIAS)
            collector.collect([user])

            for model, instances in collector.data.items():
                if hasattr(model, 'deleted_at'):
                    model.objects.filter(pk__in=[obj.pk for obj in instances]).update(deleted_at=now)

        return Response(status=status.HTTP_204_NO_CONTENT)

class RefreshTokenView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        description="",
        tags=["Auth"],
        responses = {
            200: TOKEN_REFRESH_RESPONSE,
            403: TOKEN_REFRESH_UNAUTHENTICATED_RESPONSE
        }
    )
    def post(self, request: "Request", *args, **kwargs) -> Response:
        return super().post(request, *args, **kwargs)
