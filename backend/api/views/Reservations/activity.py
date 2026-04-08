from django.core.exceptions import ObjectDoesNotExist
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.settings import GOOGLE_MAPS_API_KEY
from ..trip import get_place_data

from api.models import LodgingReservation, Trip, Place, Activity
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
            place_id = self.request.data.get('locationID')
            place_name = self.request.data.get('locationName')
            ''' Check if place exists, create if not '''
            if not Place.objects.filter(id=place_id).exists():
                place_data = get_place_data(place_id, GOOGLE_MAPS_API_KEY)
                if place_data:
                    photo_URI = place_data['photoURI'] if 'photoURI' in place_data else None
                    latitude = float(place_data['location']['latitude']) if 'location' in place_data else None
                    longitude = float(place_data['location']['longitude']) if 'location' in place_data else None
                    place = Place.objects.create(id=place_id, name=place_name, photoURI=photo_URI, latitude=latitude,
                                                 longitude=longitude)
                else:
                    raise ObjectDoesNotExist()
            else:
                place = Place.objects.get(id=place_id)
            user = self.request.user
            trip_id = self.kwargs.get('trip_id')
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            serializer.save(author=user, trip=trip, place=place)
        except Trip.DoesNotExist:
            raise PermissionDenied()


class UpdateActivity(generics.UpdateAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Activity.objects.filter(trip__group__users__in=[user])

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
        return Activity.objects.filter(trip__group__users__in=[user])