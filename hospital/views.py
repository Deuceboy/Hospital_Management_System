from django.contrib.auth import login as auth_login
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.shortcuts import render, redirect
from rest_framework import viewsets, status, permissions
from rest_framework.permissions import AllowAny
from .models import Patient, Doctor, Appointment, Medication, Prescription, Invoice, User, PatientNote, NurseReport
from .serializers import (PatientSerializer, DoctorSerializer, AppointmentSerializer,
                          MedicationSerializer, PrescriptionSerializer, InvoiceSerializer, UserSerializer,
                          PatientNoteSerializer, NurseReportSerializer)
from .serializers import AppointmentDetailSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db.models import Count
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from .permissions import IsDoctorOrReadOnly, IsDoctorOrNurse, IsNurse
from django.shortcuts import get_object_or_404
import datetime
from rest_framework.decorators import authentication_classes, permission_classes, action
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.contrib.auth import logout
from django.http import HttpResponseForbidden
from rest_framework.exceptions import ValidationError


def index(request):
    doctors = Doctor.objects.all()
    context = {
        'doctors': doctors,
    }
    return render(request, 'hospital/index.html', context)


class CustomLoginView(LoginView):

    def form_valid(self, form):
        """Security check complete. Log the user in."""
        auth_login(self.request, form.get_user())

        # Redirect based on user type
        if self.request.user.user_type == 1:  # Doctor
            return redirect('doctor_dashboard')
        elif self.request.user.user_type == 2:  # Accountant
            return redirect('accountant_dashboard')
        elif self.request.user.user_type == 3:  # Admin
            return redirect('admin_dashboard')
        elif self.request.user.user_type == 4:  # Nurse
            return redirect('nurse_dashboard')
        else:
            return redirect('index')


def doctor_dashboard(request):
    if not request.user.is_authenticated:
        return redirect('login')

    doctor = Doctor.objects.get(user=request.user)

    # Exclude completed appointments
    appointments = (Appointment.objects.filter(doctor=doctor)
                    .exclude(status="Completed")
                    .order_by('date'))  # Assuming you have a 'date' field

    patients = doctor.patients.all()

    context = {
        'doctor': doctor,
        'patients': patients,
        'appointments': appointments,
    }

    return render(request, 'hospital/doctor_dashboard.html', context)


# This checks if the user is a nurse
def is_nurse(user):
    return user.user_type == 4


@login_required  # Ensure that the user is logged in
@user_passes_test(is_nurse)  # Ensure that the user is a nurse
def nurse_dashboard(request):
    # Fetch all patients
    patients = Patient.objects.all()

    context = {
        'patients': patients,
        'nurse': request.user
    }

    return render(request, 'hospital/nurse_dashboard.html', context)


def accountant_dashboard(request):
    # Ensure only authenticated accountants can access this dashboard.
    if not request.user.is_authenticated or request.user.user_type != 2:
        return HttpResponseForbidden("You don't have permission to access this page.")

    # Fetching all patients and invoices.
    patients = Patient.objects.all()
    invoices = Invoice.objects.all()

    context = {
        'patients': patients,
        'invoices': invoices
    }

    return render(request, 'hospital/accountant_dashboard.html', context)


def assign_patient_to_doctor(patient):
    # Get all doctors and know them with the number of patients they have.
    # Order by the doctors with the least patients.
    doctors = Doctor.objects.annotate(num_patients=Count('patients')).order_by('num_patients')

    # If there are no doctors, raise an exception.
    if not doctors.exists():
        raise Exception("No doctors available to assign the patient to.")

    # Get the doctor with the least patients.
    doctor_with_least_patients = doctors.first()

    # Assign the patient to this doctor.
    doctor_with_least_patients.patients.add(patient)

    return doctor_with_least_patients


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAdminUser | IsDoctorOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Assign the newly created patient to a doctor.
        patient = Patient.objects.get(id=serializer.data['id'])
        assigned_doctor = assign_patient_to_doctor(patient)

        headers = self.get_success_headers(serializer.data)
        return Response({
            'patient': serializer.data,
            'assigned_doctor': f"{assigned_doctor.first_name} {assigned_doctor.last_name}"
        }, status=status.HTTP_201_CREATED, headers=headers)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        # Extract user and doctor data
        username = request.data.get('username')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        specialization = request.data.get('specialization')
        phone_number = request.data.get('phone_number')
        department = request.data.get('department')


        # Check if a user with the same username already exists
        if User.objects.filter(username=username).exists():
            return Response({"detail": "A user with this username already exists."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=make_password(password),
            user_type=1  # Doctor type
        )
        user.save()

        # Create doctor with the user instance
        doctor = Doctor(
            user=user,
            first_name=first_name,
            last_name=last_name,
            email=email,
            specialization=specialization,
            phone_number=phone_number,
            department=department
        )
        doctor.save()

        serializer = self.get_serializer(doctor)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PatientNoteViewSet(viewsets.ModelViewSet):
    queryset = PatientNote.objects.all()
    serializer_class = PatientNoteSerializer

    # Autofill the doctor field with the logged-in doctor:
    def perform_create(self, serializer):
        doctor_instance = get_object_or_404(Doctor, user=self.request.user)
        serializer.save(doctor=doctor_instance)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [AllowAny]  # Any patient is allowed to make an appointment

    def get_queryset(self):
        if self.action == 'list':
            return Appointment.objects.exclude(status="Completed")
        return Appointment.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AppointmentDetailSerializer
        return AppointmentSerializer

    def update(self, request, *args, **kwargs):

        # Call the default `update` method
        return super(AppointmentViewSet, self).update(request, *args, **kwargs)


class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer


@authentication_classes([SessionAuthentication])  # Include the authentication classes
@permission_classes([IsAuthenticated])  # Ensure a user is logged in
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        doctor_instance = get_object_or_404(Doctor, user=request.user)
        patient_instance = get_object_or_404(Patient, id=data['patient'])
        medication_instance = get_object_or_404(Medication, id=data['medication'])

        new_prescription = Prescription.objects.create(
            patient=patient_instance,
            doctor=doctor_instance,
            medication=medication_instance,
            dosage=data['dosage'],
            instructions=data['instructions'],
            date_prescribed=datetime.date.today()
        )

        return Response({'message': 'Prescription created successfully', 'id': new_prescription.id},
                        status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['GET'])
    def get_by_patient(self, request, patient_id=None):
        prescriptions = Prescription.objects.filter(patient_id=patient_id)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related('patient').prefetch_related('medications_prescribed')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
        # Using the patient's name or ID from the request
        patient_id = self.request.data.get('patient')
        # Fetch the patient object based on the ID.
        patient = Patient.objects.get(id=patient_id)

        # Fetch recent prescriptions for the patient. Adjust the details as needed.
        prescriptions = Prescription.objects.filter(patient=patient)

        if not prescriptions.exists():  # No prescriptions for the patient
            raise ValidationError("The patient has no prescriptions. Cannot generate an invoice.")

        # Compute the total amount
        total_amount = 0
        medications = []  # To store which medications were prescribed
        for prescription in prescriptions:
            total_amount += prescription.medication.price
            medications.append(prescription.medication)

        # Now save the invoice
        invoice = serializer.save(amount=total_amount, patient=patient)

        # Link the medications to the invoice
        invoice.medications_prescribed.set(medications)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        # Ensure passwords are hashed and not saved in plain text
        user = serializer.save()
        user.set_password(user.password)
        user.save()


class NurseReportViewSet(viewsets.ModelViewSet):
    queryset = NurseReport.objects.all()
    serializer_class = NurseReportSerializer

    def get_permissions(self):
        """
        Grant permissions based on the type of request.
        For creating a report, only nurses should have access.
        For viewing a report, only doctors and nurses should have access.
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsNurse()]
        else:
            return [permissions.IsAuthenticated(), IsDoctorOrNurse()]

    def perform_create(self, serializer):
        """
        Override the perform_create method to automatically set the nurse field.
        """
        serializer.save(nurse=self.request.user)

    @action(detail=True, methods=['GET'])
    def get_patient_details(self, request, pk=None):
        try:
            # Fetch the patient based on the provided ID
            patient = Patient.objects.get(id=pk)

            # Get the assigned doctor
            assigned_doctor = patient.doctors.first()

            # Check if there is an assigned doctor
            doctor_name = f"{assigned_doctor.first_name} {assigned_doctor.last_name}" if assigned_doctor else "Not assigned"

            # Return the details
            return Response({
                'patient_name': f"{patient.first_name} {patient.last_name}",
                'assigned_doctor': doctor_name,
                'nurse_name': f"{request.user.first_name} {request.user.last_name}",
            })
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)


def logout_view(request):
    logout(request)
    return JsonResponse({"status": "success", "message": "Logged out successfully"})
