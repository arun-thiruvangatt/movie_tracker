from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class FollowTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user("alice", password="pass12345")
        self.bob = User.objects.create_user("bob", password="pass12345")
        res = self.client.post("/api/auth/login/", {"username": "alice", "password": "pass12345"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_follow_unfollow(self):
        res = self.client.post(f"/api/users/{self.bob.id}/follow/")
        self.assertEqual(res.status_code, 201)
        res = self.client.post(f"/api/users/{self.bob.id}/follow/")
        self.assertEqual(res.status_code, 409)
        res = self.client.delete(f"/api/users/{self.bob.id}/follow/")
        self.assertEqual(res.status_code, 204)

    def test_cannot_follow_self(self):
        res = self.client.post(f"/api/users/{self.alice.id}/follow/")
        self.assertEqual(res.status_code, 400)
