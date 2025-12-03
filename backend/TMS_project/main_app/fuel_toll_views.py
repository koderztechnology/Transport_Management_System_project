from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Fuel, Toll
from .serializers import FuelSerializer, TollSerializer


class FuelViewSet(viewsets.ModelViewSet):
    queryset = Fuel.objects.all().order_by("-fuel_id")
    serializer_class = FuelSerializer
    parser_classes = (MultiPartParser, FormParser)


class TollViewSet(viewsets.ModelViewSet):
    queryset = Toll.objects.all().order_by("-toll_id")
    serializer_class = TollSerializer
    parser_classes = (MultiPartParser, FormParser)
