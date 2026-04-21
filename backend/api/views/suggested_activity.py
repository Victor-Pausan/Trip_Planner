from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import SuggestedActivity, Activity, GroupMembership
from api.serializers import SuggestedActivitySerializer, ActivitySerializer

class ApproveSuggestion(generics.CreateAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user=request.user
        suggestion_id = self.kwargs['pk']
        suggestion = SuggestedActivity.objects.get(id=suggestion_id)

        check_admin = GroupMembership.objects.filter(user=user.id, group=suggestion.trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=suggestion.trip.group.id, role='organiser')
        if not (check_admin.exists() or check_organiser.exists()):
            raise PermissionDenied()

        Activity.objects.create(place=suggestion.place, start_date=suggestion.start_date, author=suggestion.author, trip=suggestion.trip)
        return Response({'message': 'Suggestion was approved!'}, status=status.HTTP_201_CREATED)

class RejectSuggestion(generics.DestroyAPIView):
    serializer_class = SuggestedActivitySerializer
    permission_classes = [IsAuthenticated]
    queryset = SuggestedActivity.objects.all()
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        suggestion = self.get_object()

        check_admin = GroupMembership.objects.filter(user=user.id, group=suggestion.trip.group.id, role='admin')
        check_organiser = GroupMembership.objects.filter(user=user.id, group=suggestion.trip.group.id, role='organiser')
        if not (check_admin.exists() or check_organiser.exists()):
            raise PermissionDenied()

        return SuggestedActivity.objects.all()