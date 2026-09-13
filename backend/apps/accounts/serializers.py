from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["bio", "image"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined", "profile"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    profile_image = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "profile_image"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        image = validated_data.pop("profile_image", None)
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if image:
            # ensure profile exists (signal creates it)
            profile = getattr(user, 'profile', None)
            if profile is None:
                profile = Profile.objects.create(user=user)
            profile.image = image
            profile.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ["username", "email", "profile"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if profile_data:
            profile = getattr(instance, 'profile', None)
            if profile is None:
                profile = Profile.objects.create(user=instance)
            for k, v in profile_data.items():
                setattr(profile, k, v)
            profile.save()
        return instance
