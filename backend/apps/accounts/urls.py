from django.urls import path
from .views import RegisterView, MeView, UserDetailView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
]
