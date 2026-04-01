from ..models import Place

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from api.serializers import PlaceSerializer


class GetPlace(generics.RetrieveAPIView):
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    queryset = Place.objects.all()