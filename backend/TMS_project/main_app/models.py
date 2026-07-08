from django.db import models
from django.contrib.auth.models import User

# login and singup model created by ankita naik
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'Admin / Owner'),
        ('Manager', 'Manager / Accountant'),
        ('Driver', 'Driver'),
        ('Vendor', 'Vendor'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Admin')
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_profile'

    def __str__(self):
        return f"{self.user.username} - {self.role}"

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
        ('Contract', 'Contract'),
        ('Temporary', 'Temporary'),
    ]

    driver_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    license = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    altPhone = models.CharField(db_column='altphone', max_length=15, blank=True, null=True)
    experience = models.CharField(max_length=50, blank=True, null=True)

    address = models.TextField(blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    aadhar = models.CharField(max_length=20, blank=True, null=True)

    photo = models.ImageField(upload_to="drivers/photos/", blank=True, null=True)

    dob = models.DateField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)

    medical = models.TextField(blank=True, null=True)

    maritalStatus = models.CharField(db_column='marital_status', max_length=20, choices=MARITAL_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    jobType = models.CharField(db_column='jobtype', max_length=20, choices=JOB_TYPE_CHOICES, blank=True, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Active")

    added_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_date = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = 'driver'
        managed = False
        ordering = ["driver_id"]

# Create your models Ankita Naik

def fuel_photo_path(instance, filename):
    return f"fuel_bills/{instance.fuel_id}/{filename}"

def toll_photo_path(instance, filename):
    return f"toll_receipts/{instance.toll_id}/{filename}"


class Fuel(models.Model):
    fuel_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey('Vehicle', db_column='vehicle_id', on_delete=models.SET_NULL, null=True, blank=True)
    litres = models.FloatField()
    price_per_litre = models.FloatField()
    date = models.DateField()
    photo = models.ImageField(upload_to=fuel_photo_path, null=True, blank=True)

    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle} - Fuel {self.date}"

    class Meta:
        db_table = 'fuel'
        managed = False

class Toll(models.Model):
    toll_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey('Vehicle', db_column='vehicle_id', on_delete=models.SET_NULL, null=True, blank=True)
    toll_name = models.CharField(max_length=100)
    amount = models.FloatField()
    date = models.DateField()
    photo = models.ImageField(upload_to=toll_photo_path, null=True, blank=True)

    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle} - Toll {self.toll_name}"

    class Meta:
        db_table = 'toll'
        managed = False

class Vehicle(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('In Trip', 'In Trip'),
        ('Under Maintenance', 'Under Maintenance'),
    ]
    vehicle_id = models.AutoField(primary_key=True)
    vehicle_number = models.CharField(unique=True, max_length=50, blank=True, null=True)
    make = models.CharField(max_length=50, blank=True, null=True)
    model = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.CharField(max_length=50, blank=True, null=True)
    driver = models.ForeignKey('Driver', on_delete=models.SET_NULL, null=True, blank=True) 
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Available')
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle'
        managed = False

class Trip(models.Model):
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('In Progress', 'In Progress'),
        ('Scheduled', 'Scheduled'),
    ]
    trip_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey('Vehicle', db_column='vehicle_id', on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey('Driver', on_delete=models.SET_NULL, null=True, blank=True)
    start_location = models.CharField(max_length=200, blank=True, null=True)
    end_location = models.CharField(max_length=200, blank=True, null=True)
    start_time = models.DateTimeField(blank=True, null=True)
    end_time = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Scheduled')
    distance = models.FloatField(default=0)
    fuel_consumed = models.FloatField(default=0)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trip'
        managed = False

class LRBilty(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In-Transit', 'In-Transit'),
        ('Billed', 'Billed'),
    ]
    lr_id = models.AutoField(primary_key=True)
    lr_number = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    consignor = models.CharField(max_length=200, blank=True, null=True)
    consignee = models.CharField(max_length=200, blank=True, null=True)
    route = models.CharField(max_length=200, blank=True, null=True)
    vehicle = models.ForeignKey('Vehicle', db_column='vehicle_id', on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey('Driver', on_delete=models.SET_NULL, null=True, blank=True)
    material = models.CharField(max_length=200, blank=True, null=True)
    weight = models.CharField(max_length=50, blank=True, null=True)
    freight = models.CharField(max_length=50, blank=True, null=True)
    eway_bill = models.CharField(max_length=255, db_column='eway', blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lr_bilty'
        managed = False

class EWayBill(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Cancelled', 'Cancelled'),
        ('Expired', 'Expired'),
        ('Expiring Soon', 'Expiring Soon'),
        ('Critical', 'Critical')
    ]
    eway_id = models.AutoField(primary_key=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    lr = models.ForeignKey('LRBilty', on_delete=models.SET_NULL, null=True, blank=True)
    supplier_name = models.CharField(max_length=200, blank=True, null=True)
    supplier_gstin = models.CharField(max_length=50, blank=True, null=True)
    buyer_name = models.CharField(max_length=200, blank=True, null=True)
    buyer_gstin = models.CharField(max_length=50, blank=True, null=True)
    goods_description = models.CharField(max_length=300, blank=True, null=True)
    hsn_code = models.CharField(max_length=50, blank=True, null=True)
    invoice_amount = models.CharField(max_length=50, blank=True, null=True)
    vehicle = models.ForeignKey('Vehicle', db_column='vehicle_id', on_delete=models.SET_NULL, null=True, blank=True)
    route_from = models.CharField(max_length=200, blank=True, null=True)
    route_to = models.CharField(max_length=200, blank=True, null=True)
    estimated_days = models.IntegerField(default=0, blank=True, null=True)
    driver = models.ForeignKey('Driver', on_delete=models.SET_NULL, null=True, blank=True)
    driver_phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'eway_bill'
        managed = False

class FinanceTransaction(models.Model):
    TYPE_CHOICES = [
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    ]
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    ]
    transaction_id = models.AutoField(primary_key=True)
    date = models.DateField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Income')
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Completed')
    category = models.CharField(max_length=100, blank=True, null=True)
    
    vehicle = models.ForeignKey('Vehicle', on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_records')
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_records')
    vendor = models.ForeignKey('Vendor', on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_records')

    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_transaction'
        managed = False

class Vendor(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]
    vendor_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=100, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'vendor'
        managed = False

class Inventory(models.Model):
    STATUS_CHOICES = [
        ('In Stock', 'In Stock'),
        ('Low Stock', 'Low Stock'),
        ('Out of Stock', 'Out of Stock'),
    ]
    item_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    reorder_level = models.IntegerField(default=10)
    vendor = models.ForeignKey('Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='In Stock')
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory'
        managed = False

class Tracking(models.Model):
    STATUS_CHOICES = [
        ('Moving', 'Moving'),
        ('Stopped', 'Stopped'),
        ('Idle', 'Idle'),
    ]
    tracking_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey('Vehicle', to_field='vehicle_number', db_column='vehicle_Number', on_delete=models.SET_NULL, null=True, blank=True)
    current_location = models.CharField(max_length=200, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    speed = models.FloatField(default=0.0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Moving')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tracking'
        managed = False

class SystemSetting(models.Model):
    setting_id = models.AutoField(primary_key=True)
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True, null=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key

    class Meta:
        db_table = 'system_setting'
        managed = False
