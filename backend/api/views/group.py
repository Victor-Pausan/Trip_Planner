from django.db.models import F
from rest_framework.exceptions import PermissionDenied, ValidationError

from api.models import Group, GroupMembership, GroupJoinRequest, User
from django.db import transaction
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.serializers import GroupSerializer, GroupTitleSerializer, GroupJoinRequestSerializer, UserRoleSerializer, \
    UsernameSerializer, UsernameAndRoleSerializer


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
        group = Group.objects.get(pk=self.kwargs['pk'])
        group_membership = GroupMembership.objects.filter(user=user.id, group=group.id, role='admin')
        if group_membership.exists():
            return Group.objects.filter(users__in=[user])
        raise PermissionDenied()


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
        else: raise ValidationError("Join request already exists.")

class DeleteJoinGroupRequest(generics.DestroyAPIView):
    serializer_class = GroupJoinRequestSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    lookup_url_kwarg = 'request_id'

    def get_queryset(self):
        join_request = GroupJoinRequest.objects.get(id=self.kwargs['request_id'])
        group = join_request.group
        if GroupMembership.objects.filter(group=group, user=self.request.user, role='admin').exists():
            return GroupJoinRequest.objects.all()
        else:
            raise PermissionDenied()

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
            if nr_of_members <= group.max_members and not GroupMembership.objects.filter(group=group, user=requesting_user).exists():
                GroupMembership.objects.create(group=group, user=requesting_user)
                join_request.delete()
                return Response({
                    'message': 'Joined group successfully.',
                    'group': self.get_serializer(group).data,
                }, status=status.HTTP_200_OK)
            return Response({
                'message': 'Max members reached.',
            }, status=status.HTTP_406_NOT_ACCEPTABLE)
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

class GetCurrentUserRole(generics.ListAPIView):
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group = Group.objects.get(slug=self.kwargs['slug'])
        return GroupMembership.objects.filter(group=group, user=self.request.user)


class GetGroupMembers(generics.ListAPIView):
    serializer_class = UsernameAndRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_slug = self.kwargs['slug']
        group = Group.objects.get(slug=group_slug, users__in=[self.request.user])
        return User.objects.filter(trip_groups__in=[group]).annotate(role=F('groupmembership__role'))

class UpdateUserRole(generics.UpdateAPIView):
    serializer_class = GroupMembership
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        admin = self.request.user
        group_slug = request.data.get('group_slug')
        group = Group.objects.get(slug=group_slug)
        user_id = request.data.get('user_id')
        user_to_update = User.objects.get(id=user_id)
        new_role = request.data.get('new_role')
        if GroupMembership.objects.filter(group=group, user=admin, role='admin').exists():
            group_membership = GroupMembership.objects.get(group=group, user=user_to_update)
            group_membership.role = new_role
            group_membership.save()
            return Response({'message': 'User role updated.'}, status=status.HTTP_200_OK)
        return PermissionDenied('Access Forbidden.')

