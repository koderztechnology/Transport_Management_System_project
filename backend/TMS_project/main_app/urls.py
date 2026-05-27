#this url created by ankita
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .driver_views import DriverViewSet
from .fuel_toll_views import FuelViewSet, TollViewSet
from .views import VehicleViewSet, TripViewSet, LRBiltyViewSet, EWayBillViewSet, FinanceTransactionViewSet, VendorViewSet, InventoryViewSet, TrackingViewSet, SystemSettingViewSet, dashboard_summary, admin_login, admin_signup

router = DefaultRouter()
router.register("drivers", DriverViewSet)
router.register(r'fuel', FuelViewSet)
router.register(r'toll', TollViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'trips', TripViewSet)
router.register(r'lr-bilty', LRBiltyViewSet)
router.register(r'eway-bills', EWayBillViewSet)
router.register(r'finance-transactions', FinanceTransactionViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'tracking', TrackingViewSet)
router.register(r'settings', SystemSettingViewSet)


urlpatterns = [
    path("dashboard/", dashboard_summary, name="dashboard_summary"),
    path("login/", admin_login, name="admin_login"),
    path("signup/", admin_signup, name="admin_signup"),
    path("", include(router.urls)),
]
