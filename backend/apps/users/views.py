from typing import TYPE_CHECKING

from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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

class MeApi(APIView):
    permission_classes = [IsAuthenticated]

    class OutputSerializer(serializers.Serializer):
        status = serializers.ChoiceField(choices=['success', 'error'])
        data = serializers.DictField()
        message = serializers.CharField(allow_null=True)

    def get(
        self,
        request: "Request"
    ) -> "Response":
        # Mock data - returning a fixed username
        mock_username = "mock_user"

        response_data = {
            "status": "success",
            "data": {
                "username": mock_username
            },
            "message": None
        }

        return Response(response_data, status=status.HTTP_200_OK)
