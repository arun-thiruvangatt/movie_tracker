from django.core.management.base import BaseCommand
from apps.movies.models import Genre, Content, Season, Episode


class Command(BaseCommand):
    help = "Seed sample movies, series, seasons, episodes and genres."

    def handle(self, *args, **options):
        genre_names = ["Action", "Sci-Fi", "Drama", "Thriller", "Comedy", "Crime"]
        genres = {n: Genre.objects.get_or_create(name=n)[0] for n in genre_names}

        movie, _ = Content.objects.get_or_create(
            title="Inception",
            defaults=dict(
                description="A skilled thief steals secrets via dream-sharing tech.",
                content_type=Content.MOVIE,
                trailer_url="https://www.youtube.com/watch?v=YoHD9XEInc0",
            ),
        )
        movie.genres.set([genres["Sci-Fi"], genres["Thriller"]])

        series, _ = Content.objects.get_or_create(
            title="Breaking Bad",
            defaults=dict(
                description="A chemistry teacher turns to making meth.",
                content_type=Content.SERIES,
                trailer_url="https://www.youtube.com/watch?v=HhesaQXLuRY",
            ),
        )
        series.genres.set([genres["Drama"], genres["Crime"]])

        s1, _ = Season.objects.get_or_create(series=series, season_number=1, defaults={"title": "Season 1"})
        for i in range(1, 4):
            Episode.objects.get_or_create(
                season=s1, episode_number=i, defaults={"title": f"Episode {i}"}
            )

        self.stdout.write(self.style.SUCCESS("Seed data created."))
