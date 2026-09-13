from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from apps.movies.models import Content, Episode


class MovieWatch(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="movie_watches")
    movie = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="watches")
    watched_at = models.DateTimeField(null=True, blank=True)
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    class Meta:
        unique_together = ("user", "movie")
        indexes = [models.Index(fields=["user", "movie"])]


class EpisodeWatch(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="episode_watches")
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, related_name="watches")
    watched_at = models.DateTimeField(null=True, blank=True)
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    class Meta:
        unique_together = ("user", "episode")
        indexes = [models.Index(fields=["user", "episode"])]
