from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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

class UpdateFlight(generics.UpdateAPIView):
    serializer_class = FlightReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FlightReservation.objects.filter(trip__group__users__in=[user])

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
        return FlightReservation.objects.filter(trip__group__users__in=[user])
