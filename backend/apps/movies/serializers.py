from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genre, Content, Season, Episode
from apps.watchlist.models import MovieWatch, EpisodeWatch


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class ContentListSerializer(serializers.ModelSerializer):
    """Public/thumbnail view — no description/trailer details."""
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Content
        fields = ["id", "title", "image", "content_type", "genres"]


class EpisodeSerializer(serializers.ModelSerializer):
    is_watched = serializers.SerializerMethodField()
    my_rating = serializers.SerializerMethodField()

    class Meta:
        model = Episode
        fields = [
            "id", "season", "episode_number", "title", "description",
            "image", "trailer_url", "air_date", "is_watched", "my_rating",
        ]
        read_only_fields = ["season"]

    def _watch(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        return EpisodeWatch.objects.filter(user=request.user, episode=obj).first()

    def get_is_watched(self, obj):
        w = self._watch(obj)
        return bool(w and w.watched_at)

    def get_my_rating(self, obj):
        w = self._watch(obj)
        return w.rating if w else None

    def validate(self, attrs):
        season = attrs.get("season") or getattr(self.instance, "season", None)
        num = attrs.get("episode_number") or getattr(self.instance, "episode_number", None)
        qs = Episode.objects.filter(season=season, episode_number=num)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Episode number already exists in this season.")
        return attrs


class SeasonSerializer(serializers.ModelSerializer):
    episodes = EpisodeSerializer(many=True, read_only=True)

    class Meta:
        model = Season
        fields = ["id", "series", "season_number", "title", "episodes"]
        read_only_fields = ["series"]

    def validate(self, attrs):
        series = attrs.get("series") or getattr(self.instance, "series", None)
        num = attrs.get("season_number") or getattr(self.instance, "season_number", None)
        if series and series.content_type != Content.SERIES:
            raise serializers.ValidationError("Seasons can only be added to series.")
        qs = Season.objects.filter(series=series, season_number=num)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Season number already exists for this series.")
        return attrs


class ContentDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), many=True, write_only=True, source="genres", required=False
    )
    seasons = SeasonSerializer(many=True, read_only=True)
    is_watched = serializers.SerializerMethodField()
    my_rating = serializers.SerializerMethodField()
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Content
        fields = [
            "id", "title", "description", "image", "content_type", "trailer_url",
            "genres", "genre_ids", "seasons", "created_by", "created_at", "updated_at",
            "is_watched", "my_rating",
        ]

    def get_watch(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or obj.content_type != Content.MOVIE:
            return None
        return MovieWatch.objects.filter(user=request.user, movie=obj).first()

    def get_is_watched(self, obj):
        w = self.get_watch(obj)
        return bool(w and w.watched_at)

    def get_my_rating(self, obj):
        w = self.get_watch(obj)
        return w.rating if w else None
