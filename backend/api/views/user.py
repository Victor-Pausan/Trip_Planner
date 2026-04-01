from ..models import User, Group
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from api.serializers import UserSerializer, UsernameSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class GetUser(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)


class GetUsernameById(generics.RetrieveAPIView):
    serializer_class = UsernameSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()


class GetUserByGroup(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_slug = self.kwargs.get("group_slug")
        group = Group.objects.get(slug=group_slug)
        return User.objects.filter(trip_groups__in=[group])