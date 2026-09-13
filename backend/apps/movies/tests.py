from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Content, Genre


class ContentTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", password="pass12345")
        self.genre = Genre.objects.create(name="Sci-Fi")

    def auth(self):
        res = self.client.post("/api/auth/login/", {"username": "alice", "password": "pass12345"})
        token = res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_guest_can_list_but_not_view_detail(self):
        content = Content.objects.create(title="Dune", content_type=Content.MOVIE)
        res = self.client.get("/api/content/")
        self.assertEqual(res.status_code, 200)
        res = self.client.get(f"/api/content/{content.id}/")
        self.assertEqual(res.status_code, 401)

    def test_authenticated_can_create_watch_and_rate(self):
        self.auth()
        res = self.client.post("/api/content/", {
            "title": "Interstellar", "description": "space", "content_type": "movie",
        })
        self.assertEqual(res.status_code, 201)
        cid = res.data["id"]

        res = self.client.post(f"/api/content/{cid}/watch/")
        self.assertEqual(res.status_code, 200)

        res = self.client.post(f"/api/content/{cid}/rate/", {"rating": 9})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["rating"], 9)

    def test_cannot_rate_before_watch(self):
        self.auth()
        res = self.client.post("/api/content/", {"title": "Arrival", "content_type": "movie"})
        cid = res.data["id"]
        res = self.client.post(f"/api/content/{cid}/rate/", {"rating": 8})
        self.assertEqual(res.status_code, 409)
