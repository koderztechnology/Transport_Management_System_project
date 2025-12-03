
from django.db import models
# Create your models Ankita Naik
class Driver(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    MARITAL_CHOICES = [
        ('Married', 'Married'),
        ('Unmarried', 'Unmarried'),
    ]

    JOB_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
    ]

    driver_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    license = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    altPhone = models.CharField(max_length=15, blank=True, null=True)
    experience = models.CharField(max_length=50, blank=True, null=True)

    address = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    aadhar = models.CharField(max_length=20, blank=True, null=True)

    photo = models.ImageField(upload_to="drivers/photos/", blank=True, null=True)

    dob = models.DateField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)

    medical = models.TextField(blank=True, null=True)

    maritalStatus = models.CharField(max_length=20, choices=MARITAL_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    jobType = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, blank=True, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Active")

    added_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["driver_id"]

# Create your models Ankita Naik

def fuel_photo_path(instance, filename):
    return f"fuel_bills/{instance.fuel_id}/{filename}"

def toll_photo_path(instance, filename):
    return f"toll_receipts/{instance.toll_id}/{filename}"


class Fuel(models.Model):
    fuel_id = models.AutoField(primary_key=True)
    vehicle = models.CharField(max_length=50)
    litres = models.FloatField()
    price_per_litre = models.FloatField()
    date = models.DateField()
    photo = models.ImageField(upload_to=fuel_photo_path, null=True, blank=True)

    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle} - Fuel {self.date}"


class Toll(models.Model):
    toll_id = models.AutoField(primary_key=True)
    vehicle = models.CharField(max_length=50)
    toll_name = models.CharField(max_length=100)
    amount = models.FloatField()
    date = models.DateField()
    photo = models.ImageField(upload_to=toll_photo_path, null=True, blank=True)

    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle} - Toll {self.toll_name}"
