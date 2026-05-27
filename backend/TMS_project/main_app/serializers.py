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
