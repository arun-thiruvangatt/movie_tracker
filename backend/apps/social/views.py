from itertools import chain
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.serializers import UserPublicSerializer
from apps.watchlist.models import MovieWatch, EpisodeWatch
from .models import Follow
from .serializers import FeedItemSerializer


class FollowToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        target = get_object_or_404(User, pk=pk)
        if target == request.user:
            return Response({"detail": "Cannot follow yourself."}, status=400)
        obj, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if not created:
            return Response({"detail": "Already following."}, status=409)
        return Response({"following": True}, status=201)

    def delete(self, request, pk):
        target = get_object_or_404(User, pk=pk)
        deleted, _ = Follow.objects.filter(follower=request.user, following=target).delete()
        if not deleted:
            return Response({"detail": "Not following."}, status=404)
        return Response(status=204)


class FollowersListView(generics.ListAPIView):
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs["pk"]
        ids = Follow.objects.filter(following_id=pk).values_list("follower_id", flat=True)
        return User.objects.filter(id__in=ids)


class FollowingListView(generics.ListAPIView):
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        pk = self.kwargs["pk"]
        ids = Follow.objects.filter(follower_id=pk).values_list("following_id", flat=True)
        return User.objects.filter(id__in=ids)


class FeedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)

        movie_watches = MovieWatch.objects.filter(
            user_id__in=following_ids, watched_at__isnull=False
        ).select_related("user", "movie")
        episode_watches = EpisodeWatch.objects.filter(
            user_id__in=following_ids, watched_at__isnull=False
        ).select_related("user", "episode", "episode__season", "episode__season__series")

        items = []
        for w in movie_watches:
            items.append({
                "user": w.user, "content_title": w.movie.title, "content_id": w.movie.id,
                "content_type": "movie", "episode_label": None, "rating": w.rating,
                "watched_at": w.watched_at, "image": w.movie.image.url if w.movie.image else None,
            })
        for w in episode_watches:
            series = w.episode.season.series
            items.append({
                "user": w.user, "content_title": series.title, "content_id": series.id,
                "content_type": "series",
                "episode_label": f"Season {w.episode.season.season_number} Episode {w.episode.episode_number}",
                "rating": w.rating, "watched_at": w.watched_at,
                "image": series.image.url if series.image else None,
            })

        items.sort(key=lambda x: x["watched_at"], reverse=True)
        serializer = FeedItemSerializer(items[:100], many=True)
        return Response(serializer.data)
