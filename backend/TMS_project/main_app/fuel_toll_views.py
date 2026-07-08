from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Fuel, Toll
from .serializers import FuelSerializer, TollSerializer


class FuelViewSet(viewsets.ModelViewSet):
    queryset = Fuel.objects.all().order_by("-fuel_id")
    serializer_class = FuelSerializer
    parser_classes = (MultiPartParser, FormParser)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())[:100]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TollViewSet(viewsets.ModelViewSet):
    queryset = Toll.objects.all().order_by("-toll_id")
    serializer_class = TollSerializer
    parser_classes = (MultiPartParser, FormParser)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())[:100]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
