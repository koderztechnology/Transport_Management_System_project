#this url created by ankita
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .driver_views import DriverViewSet
from .fuel_toll_views import FuelViewSet, TollViewSet

router = DefaultRouter()
router.register("drivers", DriverViewSet)
router.register(r'fuel', FuelViewSet)
router.register(r'toll', TollViewSet)


urlpatterns = [
    path("", include(router.urls)),

]
