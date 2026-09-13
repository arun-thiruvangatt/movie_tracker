from rest_framework import serializers
from apps.accounts.serializers import UserPublicSerializer
from .models import Follow


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ["id", "follower", "following", "created_at"]
        read_only_fields = ["follower", "created_at"]


class FeedItemSerializer(serializers.Serializer):
    user = UserPublicSerializer()
    content_title = serializers.CharField()
    content_id = serializers.IntegerField()
    content_type = serializers.CharField()
    episode_label = serializers.CharField(allow_null=True)
    rating = serializers.IntegerField(allow_null=True)
    watched_at = serializers.DateTimeField()
    image = serializers.CharField(allow_null=True)
