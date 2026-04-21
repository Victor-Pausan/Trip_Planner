import requests
import json

from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import DataError
from django.utils import timezone
from google import genai
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from api.views.trip import get_place_data
from api.models import Trip, SuggestedActivity, Place, GroupMembership
from api.serializers import SuggestedActivitySerializer
from backend.settings import GOOGLE_AI_API_KEY, GOOGLE_MAPS_API_KEY

client = genai.Client(api_key=GOOGLE_AI_API_KEY)

class GetGeneratedActivityList(generics.CreateAPIView):
    serializer_class = SuggestedActivitySerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user=request.user
        trip = Trip.objects.get(id=self.kwargs['trip_id'])
        location_name = trip.place.name
        location_address = trip.place.address
        start_date = str(request.data.get('start_date'))
        nr_of_days = str(request.data.get('nr_of_days'))
        categories = request.data.get('categories')
        user_notes = request.data.get('user_notes')

        check_admin = GroupMembership.objects.filter(user=user.id, group=trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=trip.group.id, role='organiser')
        if not (check_admin.exists() or check_organiser.exists()):
            raise PermissionDenied()

        prompt = f"""
        You are a travel assistant.

        Generate activity suggestions for a trip.

        Context:
        - Location name: {location_name}
        - Location address: {location_address}
        - Trip start date: {start_date} (if missing use today's date)
        - Number of days: {nr_of_days}
        - User preferences: {categories}
        - User notes: {user_notes}

        Instructions:
        - Suggest 1 activity per day of the trip
        - Each activity must be tied to a specific date within the trip range
        - Each activity must be a real place with a clear, specific address
        - Always include city and country in the address
        - Prefer well-known or easily searchable places
        - Avoid vague locations and duplicates
        - If user notes exist, prioritize them

        Output format (JSON):
        [
          {{
            "place": "Full place name, full address, city, country",
            "start_date": "YYYY-MM-DD"
          }}
        ]

        Rules:
        - Output ONLY valid JSON
        - No explanations or extra text
        - Ensure dates are evenly distributed across the trip (1–2 per day)
        """

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        )

        suggestions = json.loads(response.text)
        if not isinstance(suggestions, list):
            raise ValueError("Invalid AI response")

        generated_activities = []

        for suggestion in suggestions:
            if "place" not in suggestion or "start_date" not in suggestion:
                raise ValueError("Missing fields")
            res = requests.request("POST", "https://places.googleapis.com/v1/places:autocomplete",
                                    headers = {
                                        'Content-Type': 'application/json',
                                        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                                    },
                                    data=json.dumps({'input':suggestion['place']}))
            data = res.json()
            if data['suggestions']:
                place_id = data['suggestions'][0]['placePrediction']['placeId']
                start_date = datetime.strptime(suggestion["start_date"], "%Y-%m-%d")
                start_date = timezone.make_aware(start_date)
                if not Place.objects.filter(id=place_id).exists():
                    try:
                        place_data = get_place_data(place_id, GOOGLE_MAPS_API_KEY)
                        if place_data:
                            place_name = place_data['name'] if 'name' in place_data else None
                            photo_uri = place_data['photoURI'] if 'photoURI' in place_data else None
                            latitude = float(place_data['location']['latitude']) if 'location' in place_data else None
                            longitude = float(place_data['location']['longitude']) if 'location' in place_data else None
                            address = place_data['formattedAddress'] if 'formattedAddress' in place_data else None
                            rating = float(place_data['rating']) if 'rating' in place_data else None
                            websiteUri = place_data['websiteUri'] if 'websiteUri' in place_data else None
                            description = place_data['description'] if 'description' in place_data else None
                            place = Place.objects.create(id=place_id, name=place_name, photoURI=photo_uri, latitude=latitude,
                                                        longitude=longitude, address=address, rating=rating,
                                                        websiteUri=websiteUri, description=description)
                            generated_activity = SuggestedActivity.objects.create(place=place, start_date=start_date, author=user, trip=trip)
                            generated_activities.append(generated_activity)
                        else:
                            raise ValueError()
                    except (ValidationError, DataError) as e:
                        continue
                else:
                    place = Place.objects.get(id=place_id)
                    generated_activity = SuggestedActivity.objects.create(place=place, start_date=start_date, author=user, trip=trip)
                    generated_activities.append(generated_activity)

        serializer = self.serializer_class(generated_activities, many=True)
        return Response({
            'message': "Activity suggestions generated",
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

