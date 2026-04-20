from django.core.exceptions import ObjectDoesNotExist
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import FlightReservation, Trip, GroupMembership
from api.serializers import FlightReservationSerializer


class CreateFlight(generics.ListCreateAPIView):
    serializer_class = FlightReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user = self.request.user
            trip_id = self.kwargs.get('trip_id')
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            return FlightReservation.objects.filter(trip=trip)
        except Trip.DoesNotExist:
            raise PermissionDenied()

    def perform_create(self, serializer):
        try:
            user = self.request.user
            trip_id = self.kwargs.get('trip_id')
            trip = Trip.objects.get(id=trip_id)
            check_admin = GroupMembership.objects.filter(user=user.id, group=trip.group.id, role='admin')
            check_organiser = GroupMembership.objects.filter(user=user.id, group=trip.group.id, role='organiser')
            if check_admin.exists() or check_organiser.exists():
                serializer.save(author=user, trip=trip)
            else: raise PermissionDenied()
        except ObjectDoesNotExist:
            raise PermissionDenied()

class UpdateFlight(generics.UpdateAPIView):
    serializer_class = FlightReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        reservation = FlightReservation.objects.get(id=self.kwargs.get('pk'))
        check_admin = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id, role='organiser')
        if (reservation.author == user and check_organiser.exists()) or check_admin.exists():
            return FlightReservation.objects.all()
        raise PermissionDenied()

    def put(self, request, *args, **kwargs):
        flight = self.get_object()
        serializer = self.get_serializer(flight, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class DeleteFlight(generics.DestroyAPIView):
    serializer_class = FlightReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        reservation = FlightReservation.objects.get(id=self.kwargs.get('pk'))
        check_admin = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=reservation.trip.group.id,
                                                         role='organiser')
        if (reservation.author == user and check_organiser.exists()) or check_admin.exists():
            return FlightReservation.objects.all()
        raise PermissionDenied()
