from django.urls import path
from .views import FollowToggleView, FollowersListView, FollowingListView, FeedView

urlpatterns = [
    path("users/<int:pk>/follow/", FollowToggleView.as_view(), name="follow-toggle"),
    path("users/<int:pk>/followers/", FollowersListView.as_view(), name="followers-list"),
    path("users/<int:pk>/following/", FollowingListView.as_view(), name="following-list"),
    path("feed/", FeedView.as_view(), name="feed"),
]
