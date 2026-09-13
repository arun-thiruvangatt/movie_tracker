import re
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

YOUTUBE_RE = re.compile(
    r"^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]+"
)


def validate_youtube_url(value):
    if value and not YOUTUBE_RE.match(value):
        raise ValidationError("Enter a valid YouTube URL.")


class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Content(models.Model):
    MOVIE = "movie"
    SERIES = "series"
    TYPE_CHOICES = [(MOVIE, "Movie"), (SERIES, "Series")]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="posters/", blank=True, null=True)
    content_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    trailer_url = models.URLField(blank=True, validators=[validate_youtube_url])
    genres = models.ManyToManyField(Genre, related_name="contents", blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="added_content"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["content_type"])]

    def __str__(self):
        return f"{self.title} ({self.content_type})"


class Season(models.Model):
    series = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="seasons")
    season_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("series", "season_number")
        ordering = ["season_number"]

    def clean(self):
        if self.series.content_type != Content.SERIES:
            raise ValidationError("Seasons can only be added to series content.")

    def __str__(self):
        return f"{self.series.title} - Season {self.season_number}"


class Episode(models.Model):
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="episodes")
    episode_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="episodes/", blank=True, null=True)
    trailer_url = models.URLField(blank=True, validators=[validate_youtube_url])
    air_date = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = ("season", "episode_number")
        ordering = ["episode_number"]

    def __str__(self):
        return f"{self.season} - Ep {self.episode_number}: {self.title}"
