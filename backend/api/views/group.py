from ..models import Group
from django.db import transaction
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.serializers import GroupSerializer, GroupTitleSerializer


class CreateGroup(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])

    def perform_create(self, serializer):
        group = serializer.save()
        group.users.add(self.request.user)


class DeleteGroup(generics.DestroyAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])


class GetGroup(generics.RetrieveAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])


class GetGroupByToken(generics.RetrieveAPIView):
    serializer_class = GroupTitleSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    queryset = Group.objects.all()


class AddUserToGroup(generics.UpdateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    queryset = Group.objects.all()

    def update(self, request, *args, **kwargs):
        group = self.get_object()
        user = self.request.user
        group.users.add(user)
        return Response({
            'message': 'Joined group succesfuly.',
            'group': self.get_serializer(group).data,
        }, status=status.HTTP_200_OK)


class UpdateGroupTitle(generics.UpdateAPIView):
    serializer_class = GroupTitleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])

    def patch(self, request, *args, **kwargs):
        with transaction.atomic():
            group = self.get_object()
            group = Group.objects.select_for_update().get(id=group.id)
            group.title = request.data.get('title')
            group.save()
        return Response(self.serializer_class(group).data, status=status.HTTP_200_OK)