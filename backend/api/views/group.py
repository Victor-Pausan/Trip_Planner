from rest_framework.exceptions import PermissionDenied, ValidationError

from ..models import Group, GroupMembership, GroupJoinRequest
from django.db import transaction
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.serializers import GroupSerializer, GroupTitleSerializer, GroupJoinRequestSerializer, UserRoleSerializer


class CreateGroup(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])

    def perform_create(self, serializer):
        group = serializer.save()
        GroupMembership.objects.create(group=group, user=self.request.user, role='admin')


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

class AddUserToGroupJoinRequest(generics.ListCreateAPIView):
    serializer_class = GroupJoinRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group = Group.objects.get(slug=self.kwargs['slug'])
        if GroupMembership.objects.filter(group=group, user=self.request.user, role='admin').exists():
            return GroupJoinRequest.objects.filter(group=group)
        raise PermissionDenied()

    def perform_create(self, serializer):
        user = self.request.user
        group = Group.objects.get(slug=self.kwargs['slug'])
        if not GroupJoinRequest.objects.filter(group=group, user=user).exists():
            serializer.save(group=group, user=user)
        raise ValidationError("Join request already exists.")

class DeleteJoinGroupRequest(generics.DestroyAPIView):
    serializer_class = GroupJoinRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        join_request = GroupJoinRequest.objects.get(request_id=self.kwargs['request_id'])
        group = join_request.group
        if GroupMembership.objects.filter(group=group, user=self.request.user, role='admin').exists():
            return GroupJoinRequest.objects.filter(id=self.kwargs['request_id'])
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)

class AddUserToGroup(generics.UpdateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        join_request = GroupJoinRequest.objects.get(id=self.kwargs['request_id'])
        group = join_request.group
        requesting_user = join_request.user
        admin = self.request.user
        if GroupMembership.objects.filter(group=group, user=admin, role='admin').exists():
            nr_of_members = GroupMembership.objects.filter(group=group).count()
            if nr_of_members <= group.max_members:
                GroupMembership.objects.create(group=group, user=requesting_user)
                return Response({
                    'message': 'Joined group succesfuly.',
                    'group': self.get_serializer(group).data,
                }, status=status.HTTP_200_OK)
            return Response({
                'message': 'Max members reached.',
            }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return Response({
            'message': 'Access Forbidden.',
        }, status=status.HTTP_403_FORBIDDEN)


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

class GetUserRole(generics.ListAPIView):
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group = Group.objects.get(slug=self.kwargs['slug'])
        return GroupMembership.objects.filter(group=group, user=self.request.user)