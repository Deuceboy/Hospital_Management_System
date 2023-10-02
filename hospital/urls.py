from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (PatientViewSet, DoctorViewSet, AppointmentViewSet,
                    MedicationViewSet, PrescriptionViewSet, InvoiceViewSet, UserViewSet, CustomLoginView,
                    doctor_dashboard, PatientNoteViewSet, nurse_dashboard, NurseReportViewSet, logout_view,
                    accountant_dashboard)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patient-notes', PatientNoteViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'medications', MedicationViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'users', UserViewSet)
router.register(r'nurse-reports', NurseReportViewSet)


urlpatterns = [
    path('', include(router.urls)),

    path('login/', CustomLoginView.as_view(), name='login'),

    path('logout/', logout_view, name='logout'),

    path('doctor-dashboard/', doctor_dashboard, name='doctor_dashboard'),

    path('nurse_dashboard/', nurse_dashboard, name='nurse_dashboard'),

    path('accountant_dashboard/', accountant_dashboard, name='accountant_dashboard'),

]
