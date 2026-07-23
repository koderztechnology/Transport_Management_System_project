from rest_framework import viewsets
from rest_framework.response import Response
from .models import Driver
from .serializers import DriverSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by("-driver_id")
    serializer_class = DriverSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.profile
                if profile.role == 'Driver':
                    from django.db.models import Q
                    qs = qs.filter(
                        Q(name__icontains=user.username) |
                        Q(name__icontains=user.username.replace('_', ' ')) |
                        Q(name__icontains=user.username.replace(' ', '_'))
                    )
            except Exception:
                pass
        return qs

    def get_serializer_context(self):
        return {"request": self.request}

    def list(self, request, *args, **kwargs):
        is_options = request.query_params.get('options') == 'true'
        if is_options:
            queryset = self.get_queryset().values('driver_id', 'name')[:100]
            return Response(list(queryset))
        queryset = self.get_queryset()[:100]
        data = []
        for d in queryset:
            photo_url = None
            if d.photo:
                try:
                    photo_url = request.build_absolute_uri(d.photo.url)
                except Exception:
                    photo_url = None
            data.append({
                'driver_id': d.driver_id,
                'name': d.name,
                'license': d.license,
                'phone': d.phone,
                'altPhone': d.altPhone,
                'experience': d.experience,
                'address': d.address,
                'state': d.state,
                'city': d.city,
                'aadhar': d.aadhar,
                'photo_url': photo_url,
                'dob': d.dob.isoformat() if d.dob else None,
                'age': d.age,
                'medical': d.medical,
                'maritalStatus': d.maritalStatus,
                'nationality': d.nationality,
                'jobType': d.jobType,
                'status': d.status,
            })
        return Response(data)
