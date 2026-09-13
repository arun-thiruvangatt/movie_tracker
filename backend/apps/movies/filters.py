import django_filters
from .models import Content


class ContentFilter(django_filters.FilterSet):
    genre = django_filters.CharFilter(method="filter_genre")
    type = django_filters.CharFilter(field_name="content_type")

    class Meta:
        model = Content
        fields = ["type", "genre"]

    def filter_genre(self, queryset, name, value):
        names = [v.strip() for v in value.split(",") if v.strip()]
        return queryset.filter(genres__name__in=names).distinct()
