from tkinter import CASCADE
from django.contrib.auth.models import User
from django.db import models
import hashlib

class Group(models.Model):
    users = models.ManyToManyField(User, related_name='trip_groups')
    title = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            super().save(*args, **kwargs)
            
            # Create an encrypted slug using SHA-256
            slug_source = str(self.id).encode('utf-8')
            self.slug = hashlib.sha256(slug_source).hexdigest()[:50]
            
            self.__class__.objects.filter(id=self.id).update(slug=self.slug)
            
        else:
            # Normal save if we already have a slug
            super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Place(models.Model):
    id = models.SlugField(unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    photoURI = models.CharField(max_length=300, default=None, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=300, default=None, blank=True, null=True)

class Trip(models.Model):
    title = models.CharField(max_length=100, blank=True)
    description = models.CharField(default=None, blank=True, null=True, max_length=200)
    start_date = models.DateField(default=None, blank=True, null=True)
    end_date = models.DateField(default=None, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True)
    
    def save(self, *args, **kwargs):
        if not self.title:
            super().save(*args, **kwargs)
            
            self.title = f"Trip to {self.place.name}"
            
            self.__class__.objects.filter(id=self.id).update(title=self.title)
        else:
            super().save(*args, **kwargs)

def get_sentinel_user():
    return User.objects.get_or_create(username='deleted')[0]

class Post(models.Model):
    description = models.CharField(max_length=1000)
    author = models.ForeignKey(User, on_delete=models.SET(get_sentinel_user))
    likes_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    title = models.CharField(max_length=50, default="Post")
    
class Likes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Reservation(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    notes = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class FlightReservation(Reservation):
    airline = models.CharField(max_length=255, blank=True, null=True)
    flight_code = models.CharField(max_length=10, blank=True, null=True)

    departure_airport = models.CharField(max_length=10)
    arrival_airport = models.CharField(max_length=10)

class LodgingReservation(Reservation):
    place = models.ForeignKey(Place, on_delete=models.CASCADE)

    check_in = models.DateTimeField(blank=True, null=True)
    check_out = models.DateTimeField(blank=True, null=True)

    link = models.CharField(max_length=255, blank=True, null=True)

class Activity(Reservation):
    place = models.ForeignKey(Place, on_delete=models.CASCADE)
    price = models.CharField(max_length=10, blank=True, null=True)