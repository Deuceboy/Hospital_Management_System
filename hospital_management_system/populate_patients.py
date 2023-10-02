import os
import django
import random
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_management_system.settings')
django.setup()

from hospital.models import Patient

fake = Faker()


def generate_patient_data(n=1):
    for _ in range(n):
        first_name = fake.first_name()
        last_name = fake.last_name()
        date_of_birth = fake.date_of_birth()
        gender = random.choice(['Male', 'Female'])
        address = fake.address()
        phone_number = fake.phone_number()[:15]  # Truncate to ensure it doesn't exceed 15 characters
        email = fake.email()
        medical_history = fake.text()
        insurance_information = fake.text()

        patient = Patient(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            gender=gender,
            address=address,
            phone_number=phone_number,
            email=email,
            medical_history=medical_history,
            insurance_information=insurance_information
        )

        patient.save()


if __name__ == '__main__':
    generate_patient_data(10)
