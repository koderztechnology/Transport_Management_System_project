# from rest_framework import serializers
# from .models import Driver

# class DriverSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Driver
#         fields = "__all__"
from rest_framework import serializers
from .models import Driver
from .models import Fuel, Toll, Vehicle, Trip, LRBilty, EWayBill, FinanceTransaction


class DriverSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = "__all__"  # include all model fields + below
        extra_fields = ["photo_url"]

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        else:
            data = dict(data)
        if 'jobType' in data and data['jobType']:
            val_lower = str(data['jobType']).strip().lower()
            if val_lower == 'full-time':
                data['jobType'] = 'Full-time'
            elif val_lower == 'part-time':
                data['jobType'] = 'Part-time'
            elif val_lower == 'contract':
                data['jobType'] = 'Contract'
            elif val_lower == 'temporary':
                data['jobType'] = 'Temporary'
        return super().to_internal_value(data)

    def validate_phone(self, value):
        if value:
            import re
            cleaned = re.sub(r'\D', '', value)
            if len(cleaned) != 10:
                raise serializers.ValidationError("Phone number must be exactly 10 digits.")
            qs = Driver.objects.filter(phone=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A driver with this phone number already exists.")
        return value

    def validate_license(self, value):
        if value:
            cleaned = value.strip().upper()
            qs = Driver.objects.filter(license__iexact=cleaned)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A driver with this license number already exists.")
        return value

    def validate_experience(self, value):
        if value:
            try:
                val = float(value)
                if val < 0:
                    raise serializers.ValidationError("Experience must be a positive number.")
            except ValueError:
                raise serializers.ValidationError("Experience must be a valid number.")
        return value

    def validate_dob(self, value):
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        return value

    def validate_name(self, value):
        if value:
            import re
            if not re.match(r'^[a-zA-Z\s]+$', value):
                raise serializers.ValidationError("Driver name can only contain letters and spaces.")
        return value

    def validate_city(self, value):
        if value:
            import re
            if not re.match(r'^[a-zA-Z\s]+$', value):
                raise serializers.ValidationError("City name can only contain letters and spaces.")
        return value

    def validate_state(self, value):
        if value:
            import re
            if not re.match(r'^[a-zA-Z\s]+$', value):
                raise serializers.ValidationError("State name can only contain letters and spaces.")
        return value

    def validate_nationality(self, value):
        if value:
            import re
            if not re.match(r'^[a-zA-Z\s]+$', value):
                raise serializers.ValidationError("Nationality can only contain letters and spaces.")
        return value

    def validate_aadhar(self, value):
        if value:
            import re
            cleaned = re.sub(r'[\s-]', '', value)
            if not cleaned.isdigit() or len(cleaned) != 12:
                raise serializers.ValidationError("Aadhar number must be exactly 12 digits.")
        return value

    def validate_altPhone(self, value):
        if value:
            import re
            cleaned = re.sub(r'\D', '', value)
            if len(cleaned) != 10:
                raise serializers.ValidationError("Alternative phone number must be exactly 10 digits.")
        return value

    def validate(self, attrs):
        # Prevent XSS and SQL injection across all fields
        import re
        sql_pattern = re.compile(r"[\';]--|union|select|insert|update|delete|drop", re.IGNORECASE)
        xss_pattern = re.compile(r"<script.*?>|javascript:|onload|onerror", re.IGNORECASE)
        
        for field, val in attrs.items():
            if isinstance(val, str):
                if sql_pattern.search(val):
                    raise serializers.ValidationError({field: "SQL injection payload detected."})
                if xss_pattern.search(val):
                    raise serializers.ValidationError({field: "XSS payload detected."})
        return attrs


class FuelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fuel
        fields = '__all__'

    def validate_litres(self, value):
        if value <= 0:
            raise serializers.ValidationError("Litres must be greater than zero.")
        return value

    def validate_price_per_litre(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price per litre must be greater than zero.")
        return value


class TollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Toll
        fields = '__all__'

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

    def validate_vehicle_number(self, value):
        if value:
            cleaned = value.strip().upper()
            qs = Vehicle.objects.filter(vehicle_number__iexact=cleaned)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A vehicle with this number already exists.")
        return value

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

    def validate_start_location(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Start location is required.")
        return value

    def validate_end_location(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("End location is required.")
        return value

    def validate_distance(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Distance must be a positive number.")
        return value

    def validate_fuel_consumed(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Fuel consumed must be a positive number.")
        return value

class LRBiltySerializer(serializers.ModelSerializer):
    class Meta:
        model = LRBilty
        fields = '__all__'

    def validate_lr_number(self, value):
        if value:
            cleaned = value.strip()
            qs = LRBilty.objects.filter(lr_number__iexact=cleaned)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("LR Number already exists.")
        return value

    def validate_date(self, value):
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value

    def validate_weight(self, value):
        if value is not None and float(value) <= 0:
            raise serializers.ValidationError("Weight must be a positive number.")
        return value

    def validate_freight(self, value):
        if value is not None and float(value) <= 0:
            raise serializers.ValidationError("Freight must be a positive number.")
        return value

class EWayBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = EWayBill
        fields = '__all__'

    def validate_invoice_number(self, value):
        if value:
            cleaned = value.strip()
            qs = EWayBill.objects.filter(invoice_number__iexact=cleaned)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("An E-Way bill with this invoice number already exists.")
        return value

    def validate_supplier_gstin(self, value):
        if value:
            import re
            pattern = r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'
            if not re.match(pattern, value.strip().upper()):
                raise serializers.ValidationError("Invalid Supplier GSTIN format.")
        return value

    def validate_buyer_gstin(self, value):
        if value:
            import re
            pattern = r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'
            if not re.match(pattern, value.strip().upper()):
                raise serializers.ValidationError("Invalid Buyer GSTIN format.")
        return value

    def validate_invoice_amount(self, value):
        if value is not None and float(value) <= 0:
            raise serializers.ValidationError("Invoice amount must be a positive number.")
        return value

    def validate_estimated_days(self, value):
        if value is not None and int(value) <= 0:
            raise serializers.ValidationError("Estimated days must be a positive number.")
        return value

class FinanceTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceTransaction
        fields = '__all__'

    def validate_date(self, value):
        from datetime import date
        if value:
            if value > date.today():
                raise serializers.ValidationError("Date cannot be in the future.")
            min_date = date(2025, 1, 1)
            if value < min_date:
                raise serializers.ValidationError("Historical dates before Jan 1, 2025 are not allowed.")
        return value

    def validate_amount(self, value):
        if value is not None and float(value) <= 0:
            raise serializers.ValidationError("Amount must be a positive number.")
        return value

    def validate_description(self, value):
        if value:
            import re
            if not re.match(r'^[a-zA-Z\s,.-]+$', value.strip()):
                raise serializers.ValidationError("Description cannot contain numbers, math characters, or special signs.")
        return value

from .models import Vendor, Inventory, Tracking, SystemSetting

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Vendor name is required.")
        return value.strip()

    def validate(self, data):
        name = data.get('name')
        if name:
            name_clean = name.strip()
            # unique case-insensitive check
            qs = Vendor.objects.filter(name__iexact=name_clean)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"name": "A vendor with this name already exists."})
        
        email = data.get('email')
        if email:
            import re
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                raise serializers.ValidationError({"email": "Please enter a valid email address."})
                
        return data

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class TrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tracking
        fields = '__all__'

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'
