from django.urls import path
from . import views

urlpatterns = [
    #--- users ---
    path('user/', views.GetUser.as_view(), name='get-user'),
    path('user/<int:pk>/', views.GetUsernameById.as_view(), name='get-user-by-id'),
    #--- groups ---
    path('groups/', views.CreateGroup.as_view(), name='create-group'),
    path('groups/<slug:slug>/', views.GetGroup.as_view(), name='get-group'),
    path('groups/delete/<int:pk>/', views.DeleteGroup.as_view(), name='delete-group'),
    path('groups/delete/join_request/<int:request_id>/', views.DeleteJoinGroupRequest.as_view(), name='delete-group-join-request'),
    path('groups/members/<slug:slug>/', views.GetGroupMembers.as_view(), name='get-group-members'),
    path('groups/members/update/role/', views.UpdateUserRole.as_view(), name='update-user-role'),
    path ('groups/add/user/<int:request_id>/', views.AddUserToGroup.as_view(), name='add-user-to-group'),
    path('groups/update/title/<int:pk>/', views.UpdateGroupTitle.as_view(), name='update-group-title'),
    #-- group invites --
    path('groups/token/<slug:slug>/', views.GetGroupByToken.as_view(), name='get-group-by-token'),
    path('groups/token/user_role/<slug:slug>/', views.GetCurrentUserRole.as_view(), name='get-user-role'),
    path('groups/token/process/<slug:slug>/', views.AddUserToGroupJoinRequest.as_view(), name='add-user-to-group-join-request'),
    #--- trips ---
    path('trip/create/', views.CreateTrip.as_view(), name='create-trip'),
    path('trips/user/', views.GetAllTripsOfUser.as_view(), name='get-trips-of-user'),
    path('trips/<slug:group_slug>/', views.GetAllTrips.as_view(), name='get-all-trips'),
    path('trip/get/<int:pk>/', views.GetTrip.as_view(), name='get-trip'),
    path('trip/delete/<int:pk>/', views.DeleteTrip.as_view(), name='delete-trip'),
    path('trip/update/title/<int:pk>/', views.UpdateTripTitle.as_view(), name='update-trip-title'),
    path('trip/update/dates/<int:pk>/', views.UpdateTripDates.as_view(), name='update-trip-dates'),
    #--- posts ---
    path('post/<int:trip_id>/', views.CreatePost.as_view(), name='create-post'),
    path('post/delete/<int:pk>/', views.DeletePost.as_view(), name='delete-post'),
    path('post/update/<int:pk>/', views.UpdateLikeCounter.as_view(), name='update-like-counter'),
    path('post/liked/<int:post_id>/', views.IsPostLiked.as_view(), name='is-liked-by-user'),
    #--- places ---
    path('place/<slug:pk>/', views.GetPlace.as_view(), name='get-place-info'),
    #--- reservations ---
    path('flight/<int:trip_id>/', views.CreateFlight.as_view(), name='create-flight'),
    path('flight/update/<int:pk>/', views.UpdateFlight.as_view(), name='update-flight'),
    path('flight/delete/<int:pk>/', views.DeleteFlight.as_view(), name='delete-flight'),

    path('lodging/<int:trip_id>/', views.CreateLodging.as_view(), name='create-flight'),
    path('lodging/update/<int:pk>/', views.UpdateLodging.as_view(), name='update-flight'),
    path('lodging/delete/<int:pk>/', views.DeleteLodging.as_view(), name='delete-flight'),

    path('activity/<int:trip_id>/', views.CreateActivity.as_view(), name='create-flight'),
    path('activity/update/<int:pk>/', views.UpdateActivity.as_view(), name='update-flight'),
    path('activity/delete/<int:pk>/', views.DeleteActivity.as_view(), name='delete-flight'),
    path('email/invite/', views.send_invite, name='send-email-invite'),
    path('generate/activity/suggestions/<int:trip_id>/', views.GetGeneratedActivityList.as_view(), name='generate-activity-suggestions'),
    path('suggestions/get/<int:trip_id>/', views.GetSuggestions.as_view(), name='get-suggestions'),
    path('accept/suggestion/<int:pk>/', views.ApproveSuggestion.as_view(), name='accept-suggestion'),
    path('reject/suggestion/<int:pk>/', views.RejectSuggestion.as_view(), name='reject-suggestion'),
]
