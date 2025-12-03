# from rest_framework import serializers
# from .models import Driver

# class DriverSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Driver
#         fields = "__all__"
from rest_framework import serializers
from .models import Driver
from .models import Fuel, Toll


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
