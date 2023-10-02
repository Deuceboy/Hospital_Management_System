from rest_framework import serializers
from .models import (
    Patient,
    Doctor,
    Staff,
    Appointment,
    Medication,
    Prescription,
    Invoice,
    User,
    PatientNote,
    NurseReport
)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        exclude = ('patients', 'user')


class PatientNoteSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all(), required=False)

    class Meta:
        model = PatientNote
        fields = ['id', 'patient', 'doctor', 'content', 'date_created']


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Appointment
        fields = '__all__'

    def create(self, validated_data):
        print(validated_data)
        patient_name = validated_data.pop('patient_name', None)

        # No need to check for patient_id or create new Patient instances.

        if patient_name:
            validated_data['patient_name'] = patient_name

        return Appointment.objects.create(**validated_data)


class AppointmentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ('id', 'name', 'price')



class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    medications_prescribed = MedicationSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}


class NurseReportSerializer(serializers.ModelSerializer):
    nurse = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = NurseReport
        fields = "__all__"
