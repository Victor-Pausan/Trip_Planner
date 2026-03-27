from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Group, Place, Trip, Post

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class UsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']
    

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'title', 'users', 'created_at', 'slug']
        read_only_fields = ['users', 'slug', 'created_at']

        
class GroupTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['title']

        
class TripSerializer(serializers.ModelSerializer):
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
        

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'description', 'author', 'created_at', 'likes_count', 'trip', "title"]
        read_only_fields = ['created_at', 'author', 'trip','likes_count']
        extra_kwargs = {
            'title': {'required': False, 'allow_null': True}
        }
        

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['id', 'name', 'photoURI']
        extra_kwargs = {
            'photoURI': {'required': False, 'allow_null': True}
        }