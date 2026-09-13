from rest_framework.routers import DefaultRouter
from .views import GenreViewSet, ContentViewSet, SeasonViewSet, EpisodeViewSet

router = DefaultRouter()
router.register(r"genres", GenreViewSet)
router.register(r"content", ContentViewSet)
router.register(r"seasons", SeasonViewSet)
router.register(r"episodes", EpisodeViewSet)

urlpatterns = router.urls
