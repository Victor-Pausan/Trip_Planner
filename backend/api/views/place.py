from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound

from backend.settings import GOOGLE_MAPS_API_KEY
from ..models import Place
from api.views import get_place_data

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from api.serializers import PlaceSerializer

class GetPlace(generics.RetrieveAPIView):
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            place = Place.objects.filter(id=self.kwargs['pk'])
            if not place.exists():
                raise ObjectDoesNotExist()
            return place.first()
        except ObjectDoesNotExist:
            place_id = self.kwargs.get('pk')
            place_data = get_place_data(self.kwargs.get('pk'), GOOGLE_MAPS_API_KEY)
            place_name = place_data['name'] if 'name' in place_data else None
            photo_uri = place_data['photoURI'] if 'photoURI' in place_data else None
            latitude = float(place_data['location']['latitude']) if 'location' in place_data else None
            longitude = float(place_data['location']['longitude']) if 'location' in place_data else None
            address = place_data['formattedAddress'] if 'formattedAddress' in place_data else None
            rating = float(place_data['rating']) if 'rating' in place_data else None
            websiteUri = place_data['websiteUri'] if 'websiteUri' in place_data else None
            description = place_data['description'] if 'description' in place_data else None
            return Place.objects.create(id=place_id, name=place_name, photoURI=photo_uri, latitude=latitude,
                                        longitude=longitude, address=address, rating=rating, websiteUri=websiteUri,
                                        description=description)