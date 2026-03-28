from django.db import transaction
import requests
import random

from django.db.models import F
from django.shortcuts import render
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from rest_framework.views import APIView

from backend.settings import GOOGLE_MAPS_API_KEY
from .models import Group, Trip, Post, Place, Likes
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import PlaceSerializer, UserSerializer, GroupSerializer, GroupTitleSerializer, TripSerializer, PostSerializer, UsernameSerializer

#------------------------------------------------------------------------------------
#User related views
#------------------------------------------------------------------------------------

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class GetUser(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
class GetUsernameById(generics.RetrieveAPIView):
    serializer_class = UsernameSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    
class GetUserByGroup(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        group_slug = self.kwargs.get("group_slug")
        group = Group.objects.get(slug = group_slug)
        return User.objects.filter(trip_groups__in = [group])

#------------------------------------------------------------------------------------
#Group related views
#------------------------------------------------------------------------------------


class CreateGroup(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])
    
    def perform_create(self, serializer):
        group = serializer.save()
        group.users.add(self.request.user)


class DeleteGroup(generics.DestroyAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])
    
    
class GetGroup(generics.RetrieveAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"
    
    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(users__in=[user])
    
              
class GetGroupByToken(generics.RetrieveAPIView):
    serializer_class = GroupTitleSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    queryset = Group.objects.all()

    
class AddUserToGroup(generics.UpdateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    queryset = Group.objects.all()
    
    def update(self, request, *args, **kwargs):
        group = self.get_object()
        user = self.request.user
        group.users.add(user)
        return Response({
            'message': 'Joined group succesfuly.',
            'group': self.get_serializer(group).data, 
        }, status=status.HTTP_200_OK)
  
        
#------------------------------------------------------------------------------------
#Trip related views
#------------------------------------------------------------------------------------


def get_place_photo(place_id, api_key):
    if not place_id:
        return None

    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'id,displayName,photos'
    }

    try:
        place_url = f"https://places.googleapis.com/v1/places/{place_id}"
        res = requests.get(place_url, headers=headers)
        res.raise_for_status()
        
        data = res.json()

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
                
                photo_res = requests.get(media_url, headers={ 'Content-Type': 'application/json', 'X-Goog-Api-Key': api_key })
                photo_res.raise_for_status()
                
                photo_data = photo_res.json()
                
                return photo_data.get('photoUri')

            except Exception as e:
                print(f"Error fetching photo media: {e}")
                return None
        
        return None

    except Exception as e:
        print(f"Error fetching place details: {e}")
        return None


class GetAllTrips(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        group_slug = self.kwargs.get('group_slug')
        user = self.request.user
        group = Group.objects.get(slug = group_slug)
        return Trip.objects.filter(group = group ,group__users__in = [user])
    

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
                group.users.add(user)
            else:
                group = Group.objects.get(id=self.request.data.get("group"), users__in = [user])
                
            ''' Check If Place Exists '''    
            place_id = self.request.data.get("locationID")
            place_name = self.request.data.get("locationName")
            if not Place.objects.filter(id=place_id):
                photo_URI = get_place_photo(place_id, GOOGLE_MAPS_API_KEY)
                place = Place.objects.create(id=place_id, name=place_name, photoURI=photo_URI)
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
            place.photoURI = get_place_photo(place.id, GOOGLE_MAPS_API_KEY)
            place.save()
    
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
            return Trip.objects.filter(group__users__in = [user])       
        except Trip.DoesNotExist:
            raise PermissionDenied
    
#------------------------------------------------------------------------------------
#Posts related views
#------------------------------------------------------------------------------------


class CreatePost(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        trip_id = self.kwargs.get('trip_id')
        trip = Trip.objects.get(id=trip_id, group__users__in=[user])
        return Post.objects.filter(trip=trip)
    
    def perform_create(self, serializer):
        try:
            user = self.request.user
            trip_id = self.kwargs.get("trip_id")
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            serializer.save(author=user, trip=trip)
        except Trip.DoesNotExist:
            raise PermissionDenied("Access forbidden")
        
class UpdateLikeCounter(generics.UpdateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Post.objects.filter(trip__group__users__in=[user])
    
    def patch(self, request, *args, **kwargs):
        user = request.user
        post = self.get_object()
        action = request.query_params.get('action')
        if action not in {'like', 'unlike'}:
            return Response(
                status = status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            post = Post.objects.select_for_update().get(pk=post.pk)

            if action == 'like':
                like, created = Likes.objects.get_or_create(post=post, user=user)
                if created:
                    post.likes_count += 1
                    post.save()

            elif action == 'unlike':
                deleted, _ =Likes.objects.get(post=post, user=user).delete()
                if deleted:
                    Post.objects.filter(pk=post.pk).update(likes_count=F('likes_count') - 1)

            post.refresh_from_db(fields=['likes_count'])

        serializer = self.get_serializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeletePost(generics.DestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            user = self.request.user
            return Post.objects.filter(trip__group__users__in=[user], author=user)
        except:
            raise PermissionDenied("Access forbidden")


class IsPostLiked(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request, *args, **kwargs):
        user = self.request.user
        post = self.kwargs.get('post_id')

        try:
            if Likes.objects.filter(post=post, user=user).exists():
                post = Post.objects.filter(trip__group__users__in=[user])
                return Response(
                    data = True,
                    status = status.HTTP_200_OK
                )
            else:
                print(Likes.objects.filter(post=post, user=user))
                print(False)
                return Response(
                    data=False,
                    status=status.HTTP_200_OK
                )
        except:
            raise PermissionDenied("Access Forbidden")

#------------------------------------------------------------------------------------
#Places related views
#------------------------------------------------------------------------------------

class GetPlace(generics.RetrieveAPIView):
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]
    queryset = Place.objects.all() 