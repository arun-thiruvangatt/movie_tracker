from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Genre, Content, Season, Episode
from .serializers import (
    GenreSerializer, ContentListSerializer, ContentDetailSerializer,
    SeasonSerializer, EpisodeSerializer,
)
from .permissions import IsOwnerOrStaffOrReadOnly
from .filters import ContentFilter
from apps.watchlist.models import MovieWatch, EpisodeWatch


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ContentViewSet(viewsets.ModelViewSet):
    queryset = Content.objects.all().prefetch_related("genres", "seasons__episodes")
    permission_classes = [IsOwnerOrStaffOrReadOnly]
    filterset_class = ContentFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title"]

    def get_serializer_class(self):
        if self.action == "list":
            return ContentListSerializer
        return ContentDetailSerializer

    def get_permissions(self):
        if self.action == "retrieve":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def watch(self, request, pk=None):
        movie = self.get_object()
        if movie.content_type != Content.MOVIE:
            return Response({"detail": "Only movies use this endpoint."}, status=400)
        watch, _ = MovieWatch.objects.get_or_create(user=request.user, movie=movie)
        watch.watched_at = timezone.now()
        watch.save()
        return Response({"watched": True, "watched_at": watch.watched_at})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        movie = self.get_object()
        if movie.content_type != Content.MOVIE:
            return Response({"detail": "Only movies use this endpoint."}, status=400)
        rating = request.data.get("rating")
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({"detail": "Rating must be an integer 1-10."}, status=400)
        if not 1 <= rating <= 10:
            return Response({"detail": "Rating must be between 1 and 10."}, status=400)
        watch = MovieWatch.objects.filter(user=request.user, movie=movie).first()
        if not watch or not watch.watched_at:
            return Response({"detail": "Mark as watched before rating."}, status=409)
        watch.rating = rating
        watch.save()
        return Response({"rating": watch.rating})


class SeasonViewSet(viewsets.ModelViewSet):
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer
    permission_classes = [IsOwnerOrStaffOrReadOnly]
    filterset_fields = ["series"]

    def perform_create(self, serializer):
        series = get_object_or_404(Content, pk=self.request.data.get("series"))
        serializer.save(series=series)


class EpisodeViewSet(viewsets.ModelViewSet):
    queryset = Episode.objects.all()
    serializer_class = EpisodeSerializer
    permission_classes = [IsOwnerOrStaffOrReadOnly]
    filterset_fields = ["season"]

    def perform_create(self, serializer):
        season = get_object_or_404(Season, pk=self.request.data.get("season"))
        serializer.save(season=season)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def watch(self, request, pk=None):
        episode = self.get_object()
        watch, _ = EpisodeWatch.objects.get_or_create(user=request.user, episode=episode)
        watch.watched_at = timezone.now()
        watch.save()
        return Response({"watched": True, "watched_at": watch.watched_at})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        episode = self.get_object()
        rating = request.data.get("rating")
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({"detail": "Rating must be an integer 1-10."}, status=400)
        if not 1 <= rating <= 10:
            return Response({"detail": "Rating must be between 1 and 10."}, status=400)
        watch = EpisodeWatch.objects.filter(user=request.user, episode=episode).first()
        if not watch or not watch.watched_at:
            return Response({"detail": "Mark as watched before rating."}, status=409)
        watch.rating = rating
        watch.save()
        return Response({"rating": watch.rating})
