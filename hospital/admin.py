from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Patient, Doctor, Medication, Staff

class CustomUserAdmin(UserAdmin):
    # Add user_type to the list display in the Django admin
    list_display = ('username', 'email', 'user_type')
    # Include user_type in the fieldsets to make it editable in the admin form
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('user_type',)}),
    )

class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'phone_number', 'email')
    search_fields = ('first_name', 'last_name', 'email')

class DoctorAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'specialization', 'phone_number', 'email', 'department')
    search_fields = ('first_name', 'last_name', 'email', 'specialization')

# Registering the models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Patient, PatientAdmin)
admin.site.register(Doctor, DoctorAdmin)
admin.site.register(Medication)
admin.site.register(Staff)
