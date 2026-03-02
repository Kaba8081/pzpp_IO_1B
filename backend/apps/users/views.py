from typing import TYPE_CHECKING

from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate

from .services import auth_get_for_user

if TYPE_CHECKING:
    from rest_framework.request import Request

class LoginApi(APIView):
    class InputSerializer(serializers.Serializer):
        email = serializers.EmailField()
        password = serializers.CharField(write_only=True)

    def post(
        self,
        request: "Request"
    ) -> "Response":
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data['email'],  # type: ignore
            password=serializer.validated_data['password']  # type: ignore
        )

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = auth_get_for_user(user)

        return Response({
            **tokens,
        }, status=status.HTTP_200_OK)
