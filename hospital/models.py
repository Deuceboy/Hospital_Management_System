from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password


class Patient(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    address = models.TextField()
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    medical_history = models.TextField()
    insurance_information = models.TextField()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Doctor(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    password = models.CharField(max_length=128, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    specialization = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    department = models.CharField(max_length=100)
    patients = models.ManyToManyField('Patient', related_name='doctors')

    def save(self, *args, **kwargs):
        # Check if the doctor instance has a user associated with it
        if not self.user:
            user = User(
                username=self.username,
                password=make_password(self.password),  # ensure the password is hashed
                first_name=self.first_name,
                last_name=self.last_name,
                email=self.email,
                user_type=1  # doctor user type
            )
            user.save()
            self.user = user  # link the created user to this doctor instance
        super(Doctor, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class PatientNote(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note for {self.patient} by Dr. {self.doctor} on {self.date_created}"


class Staff(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    role = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    bio = models.TextField()
    department = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Appointment(models.Model):
    patient_name = models.CharField(max_length=100, default="Unknown Patient")
    doctor = models.ForeignKey('Doctor', on_delete=models.CASCADE, related_name="doctor_appointments")
    patient = models.ForeignKey('Patient', on_delete=models.SET_NULL, null=True, blank=True,
                                related_name="patient_appointments")
    date = models.DateField()
    start_time = models.TimeField()
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    symptoms = models.TextField(null=True)
    status = models.CharField(max_length=100)

    def __str__(self):
        return f"Appointment for {self.patient_name} with Dr. {self.doctor} on {self.date}"


class Medication(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    dosage = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock_quantity = models.PositiveIntegerField()
    expiration_date = models.DateField()

    def __str__(self):
        return self.name


class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    instructions = models.TextField()
    date_prescribed = models.DateField()

    def __str__(self):
        return f"Prescription for {self.patient} by Dr. {self.doctor} ({self.medication})"


class Invoice(models.Model):
    PAYMENT_PENDING = 'Pending'
    PAYMENT_PAID = 'Paid'
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_PENDING, 'Pending'),
        (PAYMENT_PAID, 'Paid'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medications_prescribed = models.ManyToManyField(Medication)  # Linking to the Medication model
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    date_issued = models.DateField(auto_now_add=True)
    payment_status = models.CharField(
        max_length=100,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_PENDING
    )

    def __str__(self):
        return f"Invoice for {self.patient}: {self.amount}"


class User(AbstractUser):
    USER_TYPE_CHOICES = (
        (1, 'doctor'),
        (2, 'accountant'),
        (3, 'admin'),
        (4, 'nurse'),
    )
    user_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES, null=True, blank=True)

    # Adjusting the related_name for the groups relationship
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        related_name='custom_user_groups',
        related_query_name='custom_user',
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        related_name='custom_user_permissions',
        related_query_name='custom_user',
    )


class NurseReport(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True)
    date = models.DateField(auto_now_add=True)  # This will auto-fill with current date
    current_status_choices = [
        ('Critical', 'Critical'),
        ('Stable', 'Stable'),
        ('Under Observation', 'Under Observation')
    ]
    current_status = models.CharField(max_length=50, choices=current_status_choices)
    medications_treatments = models.TextField()
    other_details = models.TextField()
    nurse = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 4})

    def __str__(self):
        return f"Report for {self.patient} on {self.date}"
