from rest_framework import permissions


class IsOwnerOrStaffOrReadOnly(permissions.BasePermission):
    """Anyone can read. Only creator or staff can write."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, "created_by", None) or getattr(obj.series, "created_by", None) \
            if hasattr(obj, "series") else getattr(obj, "created_by", None)
        return request.user.is_staff or owner == request.user
