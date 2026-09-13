from rest_framework import serializers
from .models import MovieWatch, EpisodeWatch


class MovieWatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieWatch
        fields = ["id", "user", "movie", "watched_at", "rating"]
        read_only_fields = ["user"]


class EpisodeWatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = EpisodeWatch
        fields = ["id", "user", "episode", "watched_at", "rating"]
        read_only_fields = ["user"]
