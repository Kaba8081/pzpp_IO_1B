from typing import TYPE_CHECKING

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, serializers, status
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer, UserSerializer

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
        tags=['User'],
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
