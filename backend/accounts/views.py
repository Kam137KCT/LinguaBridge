from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — lets ProfilePage read and update
    preferred_language using the real logged-in user, no more user_id
    param needed."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user