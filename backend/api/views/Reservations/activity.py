from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..trip import create_place_if_nonexistent

from api.models import Trip, Activity, GroupMembership
from api.serializers import ActivitySerializer


class CreateActivity(generics.ListCreateAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user = self.request.user
            trip_id = self.kwargs.get('trip_id')
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            return Activity.objects.filter(trip=trip)
        except Trip.DoesNotExist:
            raise PermissionDenied()

    def perform_create(self, serializer):
        try:
            place = create_place_if_nonexistent(self)
            user = self.request.user
            trip_id = self.kwargs.get('trip_id')
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            check_admin = GroupMembership.objects.filter(user=user.id, group=trip.group.id, role='admin')
            check_organiser = GroupMembership.objects.filter(user=user.id, group=trip.group.id, role='organiser')
            if check_admin.exists() or check_organiser.exists():
                serializer.save(author=user, trip=trip, place=place)
            else: PermissionDenied()
        except Trip.DoesNotExist:
            raise PermissionDenied()


class UpdateActivity(generics.UpdateAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        reservation = Activity.objects.get(id=self.kwargs.get('pk'))
        check_admin = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id,
                                                         role='organiser')
        if (reservation.author == user and check_organiser.exists()) or check_admin.exists():
            return Activity.objects.all()
        raise PermissionDenied()

    def put(self, request, *args, **kwargs):
        flight = self.get_object()
        serializer = self.get_serializer(flight, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteActivity(generics.DestroyAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        reservation = Activity.objects.get(id=self.kwargs.get('pk'))
        check_admin = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id,
                                                         role='organiser')
        if (reservation.author == user and check_organiser.exists()) or check_admin.exists():
            return Activity.objects.all()
        raise PermissionDenied()