from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, UserPublicSerializer, UserUpdateSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]



class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        user = request.user
        # Debugging: log content type, keys in request.data and request.FILES
        try:
            print("[MeView] content_type:", request.content_type)
            print("[MeView] data keys:", list(request.data.keys()))
            print("[MeView] FILES keys:", list(request.FILES.keys()))
        except Exception:
            pass
        # If multipart form used, nested fields like 'profile.image' arrive as flat keys.
        # Normalize them into a nested 'profile' dict so the serializer can handle updates.
        data = request.data.copy()
        profile_data = {}
        # collect keys that begin with 'profile.' and move them under profile_data
        for k in list(data.keys()):
            if k.startswith('profile.'):
                sub = k.split('.', 1)[1]
                profile_data[sub] = data.pop(k)

        if profile_data:
            data['profile'] = profile_data

        serializer = UserUpdateSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user, context={'request': request}).data)
        return Response(serializer.errors, status=400)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]
