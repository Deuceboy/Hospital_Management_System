import os
import django
from django.core.management.base import BaseCommand

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_management_system.settings')
django.setup()
from hospital.models import Doctor, Patient


class Command(BaseCommand):
    help = 'Assign patients to doctors'

    def handle(self, *args, **options):
        # Get all patients without doctors
        patients_without_doctors = Patient.objects.filter(doctors=None)

        # If you want to assign patients to specific doctors, adjust the following query
        doctors = Doctor.objects.all()

        for patient in patients_without_doctors:
            # This is a simple assignment logic; modify as needed
            doctor = doctors.order_by('?').first()
            patient.doctors.add(doctor)

        self.stdout.write(self.style.SUCCESS('Successfully assigned patients to doctors'))
