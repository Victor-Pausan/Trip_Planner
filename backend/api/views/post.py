from django.db import transaction
from django.db.models import F

from ..models import Trip, Post, Likes

from django.core.exceptions import PermissionDenied

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import PostSerializer


class CreatePost(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user = self.request.user
            trip_id = self.kwargs.get('trip_id')
            trip = Trip.objects.get(id=trip_id, group__users__in=[user])
            return Post.objects.filter(trip=trip)
        except Trip.DoesNotExist:
            raise PermissionDenied()

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
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            post = Post.objects.select_for_update().get(pk=post.pk)

            if action == 'like':
                like, created = Likes.objects.get_or_create(post=post, user=user)
                if created:
                    post.likes_count += 1
                    post.save()

            elif action == 'unlike':
                deleted, _ = Likes.objects.get(post=post, user=user).delete()
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

    def get(self, request, *args, **kwargs):
        user = self.request.user
        post = self.kwargs.get('post_id')

        try:
            if Likes.objects.filter(post=post, user=user).exists():
                post = Post.objects.filter(trip__group__users__in=[user])
                return Response(
                    data=True,
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    data=False,
                    status=status.HTTP_200_OK
                )
        except:
            raise PermissionDenied("Access Forbidden")