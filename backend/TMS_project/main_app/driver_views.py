from rest_framework import viewsets
from .models import Driver
from .serializers import DriverSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by("-driver_id")
    serializer_class = DriverSerializer

    def get_serializer_context(self):
        return {"request": self.request}
