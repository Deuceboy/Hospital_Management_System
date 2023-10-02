from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework import permissions


class IsAdminOrDoctor(BasePermission):
    """
    Custom permission:
    - Allow admin to do everything
    - Allow doctors to view all patients and update medical records
    - Allow other authenticated users to only view patient details
    """

    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        if request.user.is_authenticated:
            # If it's a safe method (GET, HEAD, or OPTIONS) or a PATCH request, allow it
            if request.method in SAFE_METHODS or request.method == 'PATCH':
                return True
        return False

    def has_object_permission(self, request, view, obj):
        # For detailed views, let's restrict the PATCH (update) method to only doctors
        if request.method == 'PATCH':
            return hasattr(request.user, 'doctor')  # This checks if the user is a doctor
        return True


class IsDoctorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow doctors to edit the medical history.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD, or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only doctors are allowed to update medical history.
        # Assuming there's a way to check if a user is a doctor,
        # For example, if the doctor has a related user model:
        return hasattr(request.user, 'doctor')


class IsNurse(permissions.BasePermission):
    """
    Custom permission to only allow nurses to create a report.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 4


class IsDoctorOrNurse(permissions.BasePermission):
    """
    Custom permission to only allow doctors and nurses to view the reports.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.user_type == 1 or request.user.user_type == 4)
