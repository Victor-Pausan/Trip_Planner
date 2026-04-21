from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Group, Place, Trip, Post, FlightReservation, LodgingReservation, Activity, GroupJoinRequest, \
    GroupMembership

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email' : {'required' : True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class UsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class UsernameAndRoleSerializer(serializers.ModelSerializer):
    role = serializers.CharField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = ['role']
        read_only_fields = ['role']

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'title', 'users', 'created_at', 'slug']
        read_only_fields = ['users', 'slug', 'created_at']

class GroupTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['title']

class GroupJoinRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupJoinRequest
        fields = ['id', 'user']
        read_only_fields = ['user']
        
class TripSerializer(serializers.ModelSerializer):
    group = serializers.SlugRelatedField(read_only=True, slug_field='slug')
    class Meta:
        model = Trip
        fields = ['id', 'title', 'created_at', 'description', 'group', 'place' ,'start_date', "end_date"]
        read_only_fields = ['created_at']
        extra_kwargs = {
            'group': {'required': False, 'allow_null': True},
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True}
        }

    def to_internal_value(self, data):
        """
        Treat empty strings for optional date fields as None so DRF does not
        try to parse them as dates and return a validation error.
        """
        data = data.copy()
        for field in ("start_date", "end_date"):
            if data.get(field) == "":
                data[field] = None
        return super().to_internal_value(data)
        
class TripTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['title']

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'description', 'author', 'created_at', 'likes_count', 'trip', "title"]
        read_only_fields = ['created_at', 'author', 'trip', 'likes_count']
        extra_kwargs = {
            'title': {'required': False, 'allow_null': True}
        }
        

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['id', 'name', 'photoURI', 'latitude', 'longitude', 'address', 'rating', 'websiteUri', 'description']
        extra_kwargs = {
            'photoURI': {'required': False, 'allow_null': True},
            'rating': {'required': False, 'allow_null': True},
            'websiteUri': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_null': True}
        }

class FlightReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightReservation
        fields = ['id', 'author',
                  'airline', 'flight_code',
                  'departure_airport', 'arrival_airport',
                  'start_date', 'end_date',
                  'notes', 'created_at']
        read_only_fields = ['author', 'trip', 'created_at']
        extra_kwargs = {
            'airline': {'required': False, 'allow_null': True},
            'flight_code': {'required': False, 'allow_null': True},
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True},
            'notes': {'required': False, 'allow_null': True}
        }

    def to_internal_value(self, data):
        """
        Treat empty strings for optional date fields as None so DRF does not
        try to parse them as dates and return a validation error.
        """
        data = data.copy()
        for field in ("start_date", "end_date"):
            if data.get(field) == "":
                data[field] = None
        return super().to_internal_value(data)

class LodgingReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LodgingReservation
        fields = ['id', 'author',
                  'place', 'link',
                  'start_date', 'end_date',
                  'notes', 'created_at']
        read_only_fields = ['author', 'trip', 'created_at', 'place']
        extra_kwargs = {
            'link': {'required': False, 'allow_null': True},
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True},
            'notes': {'required': False, 'allow_null': True}
        }

    def to_internal_value(self, data):
        """
        Treat empty strings for optional date fields as None so DRF does not
        try to parse them as dates and return a validation error.
        """
        data = data.copy()
        for field in ("start_date", "end_date"):
            if data.get(field) == "":
                data[field] = None
        return super().to_internal_value(data)

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'author',
                  'place',
                  'start_date', 'end_date',
                  'notes', 'created_at']
        read_only_fields = ['author', 'trip', 'created_at', 'place']
        extra_kwargs = {
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True},
            'notes': {'required': False, 'allow_null': True}
        }

    def to_internal_value(self, data):
        """
        Treat empty strings for optional date fields as None so DRF does not
        try to parse them as dates and return a validation error.
        """
        data = data.copy()
        for field in ("start_date", "end_date"):
            if data.get(field) == "":
                data[field] = None
        return super().to_internal_value(data)

class SuggestedActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'start_date',
                  'place', 'created_at']
        read_only_fields = ['author', 'trip', 'created_at', 'place']