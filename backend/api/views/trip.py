import random
import requests

from ..models import Trip, Group, Place, GroupMembership

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist, PermissionDenied

from backend.settings import GOOGLE_MAPS_API_KEY

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.serializers import TripSerializer, GroupTitleSerializer


def get_place_data(place_id, api_key):
    if not place_id:
        return None

    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'id,displayName,photos,location'
    }

    try:
        place_url = f"https://places.googleapis.com/v1/places/{place_id}"
        res = requests.get(place_url, headers=headers)
        res.raise_for_status()

        place_data = {}

        data = res.json()

        if 'location' in data and data['location']:
            place_data['location'] = data['location']

        if 'photos' in data and data['photos']:
            photos = data['photos']
            photo_name = random.choice(photos)['name']

            try:
                media_url = f"https://places.googleapis.com/v1/{photo_name}/media?skipHttpRedirect=true&maxHeightPx=400&maxWidthPx=600"
                params = {
                    'skipHttpRedirect': 'true',
                    'maxHeightPx': 400,
                    'maxWidthPx': 600
                }

                photo_res = requests.get(media_url,
                                         headers={'Content-Type': 'application/json', 'X-Goog-Api-Key': api_key})
                photo_res.raise_for_status()

                photo_data = photo_res.json()

                place_data['photoURI'] = photo_data.get('photoUri')

            except Exception as e:
                print(f"Error fetching photo media: {e}")
                return None

        return place_data

    except Exception as e:
        print(f"Error fetching place details: {e}")
        return None


class GetAllTrips(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_slug = self.kwargs.get('group_slug')
        user = self.request.user
        group = Group.objects.get(slug=group_slug)
        return Trip.objects.filter(group=group, group__users__in=[user])


class CreateTrip(generics.CreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            user = self.request.user
            ''' Check If Group Exists '''
            group_id = self.request.data.get("group")
            if group_id == "" or group_id == None:
                group = Group.objects.create(title=f"Group for {self.request.data.get("locationName")}")
                GroupMembership.objects.create(group=group, user=self.request.user, role='admin')
            else:
                group = Group.objects.get(id=self.request.data.get("group"), users__in=[user])

            ''' Check If Place Exists '''
            place_id = self.request.data.get("locationID")
            place_name = self.request.data.get("locationName")
            if not Place.objects.filter(id=place_id):
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
            serializer.save(group=group, place=place)
        except Group.DoesNotExist:
            raise PermissionDenied("Access forbidden.")


class GetTrip(generics.RetrieveAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def update_picture(self, user):
        trip_id = self.kwargs["pk"]
        trip = Trip.objects.get(id=trip_id, group__users__in=[user])
        if trip.place:
            place = Place.objects.get(id=trip.place.id)
            place_data = get_place_data(place.id, GOOGLE_MAPS_API_KEY)
            if place_data:
                photo_URI = place_data['photoURI']
                latitude = float(place_data['location']['latitude'])
                longitude = float(place_data['location']['longitude'])
                place.photoURI = photo_URI
                place.latitude = latitude
                place.longitude = longitude
                place.save()
            else:
                raise ObjectDoesNotExist()

    def get_queryset(self):
        user = self.request.user
        self.update_picture(user)
        trip = Trip.objects.filter(group__users__in=[user])
        return trip


class DeleteTrip(generics.DestroyAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user = self.request.user
            return Trip.objects.filter(group__users__in=[user])
        except Trip.DoesNotExist:
            raise PermissionDenied


class GetAllTripsOfUser(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        groups = Group.objects.filter(users__in=[user])
        return Trip.objects.filter(group__in=groups)


class UpdateTripTitle(generics.UpdateAPIView):
    serializer_class = GroupTitleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Trip.objects.filter(group__users__in=[user])

    def patch(self, request, *args, **kwargs):
        with transaction.atomic():
            trip = self.get_object()
            trip = Trip.objects.select_for_update().get(id=trip.id)
            trip.title = request.data.get('title')
            trip.save()
        return Response(self.get_serializer(trip).data, status=status.HTTP_200_OK)