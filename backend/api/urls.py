from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.GetUser.as_view(), name='get-user'),
    path('user/<int:pk>/', views.GetUsernameById.as_view(), name='get-user-by-id'),
    
    path('groups/', views.CreateGroup.as_view(), name='create-group'),
    path('groups/<slug:slug>/', views.GetGroup.as_view(), name='get-group'),
    path('groups/delete/<int:pk>/', views.DeleteGroup.as_view(), name='delete-group'),
    path('groups/members/<slug:group_slug>/', views.GetUserByGroup.as_view(), name='get-group-members'),
    
    path('groups/token/<slug:slug>/', views.GetGroupByToken.as_view(), name='get-group-by-token'),
    path('groups/token/process/<slug:slug>/', views.AddUserToGroup.as_view(), name='add-user-to-group'),
    
    path('trip/create/', views.CreateTrip.as_view(), name='create-trip'),
    path('trips/<slug:group_slug>/', views.GetAllTrips.as_view(), name='get-all-trips'),
    path('trip/get/<int:pk>/', views.GetTrip.as_view(), name='get-trip'),
    path('trip/delete/<int:pk>/', views.DeleteTrip.as_view(), name='delete-trip'),
    
    path('post/<int:trip_id>/', views.CreatePost.as_view(), name='create-post'),
    path('post/delete/<int:pk>/', views.DeletePost.as_view(), name='delete-post'),
    path('post/update/<int:pk>/', views.UpdateLikeCounter.as_view(), name='update-like-counter'),
    path('post/liked/<int:post_id>/', views.IsPostLiked.as_view(), name='is-liked-by-user'),
    
    path('place/<slug:pk>/', views.GetPlace.as_view(), name='get-place-info'),
]
