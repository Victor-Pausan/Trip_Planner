from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from api.models import FlightReservation, Trip
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
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            serializer.save(author=user, trip=trip)
        except Trip.DoesNotExist:
            raise PermissionDenied()

#TODO: create views for update and delete and PATHS