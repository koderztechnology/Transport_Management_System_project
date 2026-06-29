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
        if obj.photo:
            return request.build_absolute_uri(obj.photo.url)
        return None


class FuelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fuel
        fields = '__all__'


class TollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Toll
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class LRBiltySerializer(serializers.ModelSerializer):
    class Meta:
        model = LRBilty
        fields = '__all__'

class EWayBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = EWayBill
        fields = '__all__'

class FinanceTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceTransaction
        fields = '__all__'

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
