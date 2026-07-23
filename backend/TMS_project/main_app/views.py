from rest_framework import viewsets

from .models import Vehicle, Trip, LRBilty, EWayBill, FinanceTransaction
from .serializers import VehicleSerializer, TripSerializer, LRBiltySerializer, EWayBillSerializer, FinanceTransactionSerializer
from .models import Vendor, Inventory, Tracking, SystemSetting
from .serializers import VendorSerializer, InventorySerializer, TrackingSerializer, SystemSettingSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by('-pk')
    serializer_class = VehicleSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.profile
                if profile.role == 'Driver':
                    from django.db.models import Q
                    qs = qs.filter(
                        Q(driver__name__icontains=user.username) |
                        Q(driver__name__icontains=user.username.replace('_', ' ')) |
                        Q(driver__name__icontains=user.username.replace(' ', '_'))
                    )
            except Exception:
                pass
        return qs

    def list(self, request, *args, **kwargs):
        is_options = request.query_params.get('options') == 'true'
        if is_options:
            queryset = self.filter_queryset(self.get_queryset()).values('vehicle_id', 'vehicle_number')[:100]
            return Response(list(queryset))
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for v in queryset:
            data.append({
                'vehicle_id': v.vehicle_id,
                'vehicle_number': v.vehicle_number,
                'make': v.make,
                'model': v.model,
                'chassis_number': v.chassis_number,
                'capacity': v.capacity,
                'driver': v.driver_id,
                'status': v.status,
            })
        return Response(data)

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-pk')
    serializer_class = TripSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.profile
                if profile.role == 'Driver':
                    from django.db.models import Q
                    qs = qs.filter(
                        Q(driver__name__icontains=user.username) |
                        Q(driver__name__icontains=user.username.replace('_', ' ')) |
                        Q(driver__name__icontains=user.username.replace(' ', '_'))
                    )
            except Exception:
                pass
        return qs

    def list(self, request, *args, **kwargs):
        is_options = request.query_params.get('options') == 'true'
        if is_options:
            queryset = self.filter_queryset(self.get_queryset()).values('trip_id', 'start_location', 'end_location')[:100]
            return Response(list(queryset))
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for t in queryset:
            data.append({
                'trip_id': t.trip_id,
                'vehicle': t.vehicle_id,
                'driver': t.driver_id,
                'start_location': t.start_location,
                'end_location': t.end_location,
                'start_time': t.start_time.isoformat() if t.start_time else None,
                'end_time': t.end_time.isoformat() if t.end_time else None,
                'status': t.status,
                'distance': t.distance,
                'fuel_consumed': t.fuel_consumed,
            })
        return Response(data)

class LRBiltyViewSet(viewsets.ModelViewSet):
    queryset = LRBilty.objects.all().order_by('-pk')
    serializer_class = LRBiltySerializer

    def list(self, request, *args, **kwargs):
        is_options = request.query_params.get('options') == 'true'
        if is_options:
            queryset = self.filter_queryset(self.get_queryset()).values('lr_id', 'lr_number')[:100]
            return Response(list(queryset))
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for l in queryset:
            data.append({
                'lr_id': l.lr_id,
                'lr_number': l.lr_number,
                'date': l.date.isoformat() if l.date else None,
                'consignor': l.consignor,
                'consignee': l.consignee,
                'route': l.route,
                'vehicle': l.vehicle_id,
                'driver': l.driver_id,
                'material': l.material,
                'weight': l.weight,
                'freight': l.freight,
                'eway_bill': l.eway_bill,
                'status': l.status,
            })
        return Response(data)

class EWayBillViewSet(viewsets.ModelViewSet):
    queryset = EWayBill.objects.all().order_by('-pk')
    serializer_class = EWayBillSerializer

    def list(self, request, *args, **kwargs):
        is_options = request.query_params.get('options') == 'true'
        if is_options:
            queryset = self.filter_queryset(self.get_queryset()).values('eway_id', 'invoice_number')[:100]
            return Response(list(queryset))
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for e in queryset:
            data.append({
                'eway_id': e.eway_id,
                'invoice_number': e.invoice_number,
                'lr': e.lr_id,
                'supplier_name': e.supplier_name,
                'supplier_gstin': e.supplier_gstin,
                'buyer_name': e.buyer_name,
                'buyer_gstin': e.buyer_gstin,
                'goods_description': e.goods_description,
                'hsn_code': e.hsn_code,
                'invoice_amount': float(e.invoice_amount) if e.invoice_amount is not None else 0.0,
                'vehicle': e.vehicle_id,
                'route_from': e.route_from,
                'route_to': e.route_to,
                'estimated_days': e.estimated_days,
                'driver': e.driver_id,
                'driver_phone': e.driver_phone,
                'status': e.status,
                'added_date': e.added_date.isoformat() if e.added_date else None,
            })
        return Response(data)

class FinanceTransactionViewSet(viewsets.ModelViewSet):
    queryset = FinanceTransaction.objects.all().order_by('-pk')
    serializer_class = FinanceTransactionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.profile
                if profile.role == 'Vendor':
                    from django.db.models import Q
                    qs = qs.filter(
                        Q(vendor__name__icontains=user.username) |
                        Q(vendor__name__icontains=user.username.replace('_', ' ')) |
                        Q(vendor__name__icontains=user.username.replace(' ', '_')) |
                        Q(vendor__contact_person__icontains=user.username) |
                        Q(vendor__contact_person__icontains=user.username.replace('_', ' ')) |
                        Q(vendor__contact_person__icontains=user.username.replace(' ', '_'))
                    )
            except Exception:
                pass
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for txn in queryset:
            data.append({
                'id': txn.pk,
                'date': txn.date.isoformat() if txn.date else None,
                'type': txn.type,
                'category': txn.category,
                'amount': float(txn.amount) if txn.amount is not None else 0.0,
                'status': txn.status,
                'description': txn.description,
                'vehicle': txn.vehicle_id,
                'trip': txn.trip_id,
                'vendor': txn.vendor_id,
            })
        return Response(data)


import logging
import os

log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audit.log')
audit_logger = logging.getLogger('audit')
audit_logger.setLevel(logging.INFO)

if not audit_logger.handlers:
    fh = logging.FileHandler(log_file_path)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    audit_logger.addHandler(fh)

def log_audit_event(message):
    audit_logger.info(message)

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by('-pk')
    serializer_class = VendorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.profile
                if profile.role == 'Vendor':
                    from django.db.models import Q
                    qs = qs.filter(
                        Q(name__icontains=user.username) |
                        Q(name__icontains=user.username.replace('_', ' ')) |
                        Q(name__icontains=user.username.replace(' ', '_')) |
                        Q(contact_person__icontains=user.username) |
                        Q(contact_person__icontains=user.username.replace('_', ' ')) |
                        Q(contact_person__icontains=user.username.replace(' ', '_'))
                    )
            except Exception:
                pass
        return qs

    def list(self, request, *args, **kwargs):
        is_options = request.query_params.get('options') == 'true'
        if is_options:
            queryset = self.filter_queryset(self.get_queryset()).values('vendor_id', 'name')[:100]
            return Response(list(queryset))
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save()
        is_import = self.request.query_params.get('import') == 'true'
        if is_import:
            log_audit_event(f"Bulk import vendor created: {instance.name} (ID: {instance.vendor_id})")
        else:
            log_audit_event(f"Vendor created: {instance.name} (ID: {instance.vendor_id})")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_audit_event(f"Vendor updated: {instance.name} (ID: {instance.vendor_id})")

    def perform_destroy(self, instance):
        vendor_id = instance.vendor_id
        name = instance.name
        email = instance.email
        
        # Delete Django auth user if they exist
        from django.contrib.auth.models import User
        user_qs = User.objects.filter(username=name)
        if email:
            user_qs = user_qs | User.objects.filter(email=email)
        user_qs.delete()
        
        instance.delete()
        log_audit_event(f"Vendor deleted: {name} (ID: {vendor_id})")

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().order_by('-pk')
    serializer_class = InventorySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for i in queryset:
            data.append({
                'item_id': i.item_id,
                'name': i.name,
                'category': i.category,
                'quantity': i.quantity,
                'unit_price': float(i.unit_price) if i.unit_price is not None else 0.0,
                'reorder_level': i.reorder_level,
                'vendor': i.vendor_id,
                'status': i.status,
                'added_date': i.added_date.isoformat() if i.added_date else None,
            })
        return Response(data)

class TrackingViewSet(viewsets.ModelViewSet):
    queryset = Tracking.objects.all().order_by('-pk')
    serializer_class = TrackingSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            try:
                profile = user.profile
                if profile.role == 'Driver':
                    from django.db.models import Q
                    qs = qs.filter(
                        Q(vehicle__driver__name__icontains=user.username) |
                        Q(vehicle__driver__name__icontains=user.username.replace('_', ' ')) |
                        Q(vehicle__driver__name__icontains=user.username.replace(' ', '_'))
                    )
            except Exception:
                pass
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())[:100]
        data = []
        for t in queryset:
            data.append({
                'tracking_id': t.tracking_id,
                'vehicle': t.vehicle_id,
                'latitude': float(t.latitude) if t.latitude is not None else 0.0,
                'longitude': float(t.longitude) if t.longitude is not None else 0.0,
                'speed': float(t.speed) if t.speed is not None else 0.0,
                'status': t.status,
                'timestamp': t.timestamp.isoformat() if t.timestamp else None,
                'current_location': t.current_location,
            })
        return Response(data)

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime
from .models import Driver

@api_view(['GET'])
def dashboard_summary(request):
    username = request.GET.get('username', '')
    role = request.GET.get('role', 'Admin')

    trip_qs = Trip.objects.all()
    finance_qs = FinanceTransaction.objects.all()
    vehicle_qs = Vehicle.objects.all()
    driver_qs = Driver.objects.all()

    user_trips = trip_qs
    user_finance = finance_qs
    user_vehicles = vehicle_qs

    from django.db.models import Q
    if role == 'Driver' and username:
        user_trips = trip_qs.filter(
            Q(driver__name__icontains=username) |
            Q(driver__name__icontains=username.replace('_', ' ')) |
            Q(driver__name__icontains=username.replace(' ', '_'))
        )
        user_finance = finance_qs.filter(
            Q(trip__driver__name__icontains=username) |
            Q(trip__driver__name__icontains=username.replace('_', ' ')) |
            Q(trip__driver__name__icontains=username.replace(' ', '_'))
        )
        user_vehicles = vehicle_qs.filter(
            Q(driver__name__icontains=username) |
            Q(driver__name__icontains=username.replace('_', ' ')) |
            Q(driver__name__icontains=username.replace(' ', '_'))
        )
    elif role == 'Vendor' and username:
        user_trips = trip_qs.none()
        user_finance = finance_qs.filter(
            Q(vendor__name__icontains=username) |
            Q(vendor__name__icontains=username.replace('_', ' ')) |
            Q(vendor__name__icontains=username.replace(' ', '_')) |
            Q(vendor__contact_person__icontains=username) |
            Q(vendor__contact_person__icontains=username.replace('_', ' ')) |
            Q(vendor__contact_person__icontains=username.replace(' ', '_'))
        )
        user_vehicles = vehicle_qs.none()

    # Helper for formatting Indian currency
    def format_indian_currency(amount):
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return f"₹{amount}"
        
        s = f"{amount:.2f}"
        parts = s.split('.')
        num = parts[0]
        dec = parts[1] if len(parts) > 1 else '00'
        
        is_negative = num.startswith('-')
        if is_negative:
            num = num[1:]
            
        if len(num) <= 3:
            res = num
        else:
            last_three = num[-3:]
            remaining = num[:-3]
            groups = []
            while len(remaining) > 0:
                groups.append(remaining[-2:])
                remaining = remaining[:-2]
            groups.reverse()
            res = ",".join(groups) + "," + last_three
            
        prefix = "-₹" if is_negative else "₹"
        return f"{prefix}{res}.{dec}"

    # OPTIMIZATION 1: Fetch status counts in single queries instead of separate filter().count() calls
    from django.db.models import Count
    if role == 'Driver' and username:
        trip_status_counts = dict(user_trips.values('status').annotate(count=Count('status')).values_list('status', 'count'))
    else:
        trip_status_counts = dict(trip_qs.values('status').annotate(count=Count('status')).values_list('status', 'count'))

    vehicle_status_counts = dict(vehicle_qs.values('status').annotate(count=Count('status')).values_list('status', 'count'))
    driver_status_counts = dict(driver_qs.values('status').annotate(count=Count('status')).values_list('status', 'count'))

    active_trips_count = trip_status_counts.get('In Progress', 0) + trip_status_counts.get('Running', 0)
    available_vehicles_count = vehicle_status_counts.get('Available', 0)
    active_drivers_count = driver_status_counts.get('Active', 0)
    
    # OPTIMIZATION 2: Single query to fetch finance transactions list and aggregate in-memory
    all_txns = list(user_finance)
    pending_payments = sum(float(t.amount) for t in all_txns if t.status == 'Pending')
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    monthly_income = sum(float(t.amount) for t in all_txns if t.type == 'Income' and t.date and t.date.month == current_month and t.date.year == current_year and t.status == 'Completed')
    monthly_expense = sum(float(t.amount) for t in all_txns if t.type == 'Expense' and t.date and t.date.month == current_month and t.date.year == current_year and t.status == 'Completed')
    monthly_profit = monthly_income - monthly_expense
    
    # RENDER KPI CARDS BASED ON ROLE
    if role == 'Driver':
        driver_obj = Driver.objects.filter(name__icontains=username).first()
        driver_status = driver_obj.status if driver_obj else 'Active'
        total_dist = user_trips.aggregate(total=Sum('distance'))['total'] or 0
        total_earnings = sum(t.distance * 10 for t in user_trips)
        kpiCards = [
            {
                'title': 'Your Active Trips',
                'value': str(active_trips_count),
                'change': '+0%', 'trend': 'up', 'icon': 'local_shipping', 'iconBg': 'bg-blue-500/10', 'iconColor': 'text-blue-500', 'status': 'good'
            },
            {
                'title': 'Your Completed Trips',
                'value': str(trip_status_counts.get('Completed', 0)),
                'change': '+0%', 'trend': 'up', 'icon': 'check_circle', 'iconBg': 'bg-green-500/10', 'iconColor': 'text-green-500', 'status': 'good'
            },
            {
                'title': 'Total Distance',
                'value': f"{total_dist} km",
                'change': '+0%', 'trend': 'up', 'icon': 'speed', 'iconBg': 'bg-purple-500/10', 'iconColor': 'text-purple-500', 'status': 'good'
            },
            {
                'title': 'Estimated Earnings',
                'value': format_indian_currency(total_earnings),
                'change': '+0%', 'trend': 'up', 'icon': 'payments', 'iconBg': 'bg-orange-500/10', 'iconColor': 'text-orange-500', 'status': 'good'
            },
            {
                'title': 'Your License Status',
                'value': driver_status,
                'change': '+0%', 'trend': 'up', 'icon': 'badge', 'iconBg': 'bg-teal-500/10', 'iconColor': 'text-teal-500', 'status': 'good'
            }
        ]
    elif role == 'Vendor':
        completed_payments = sum(float(t.amount) for t in all_txns if t.status == 'Completed')
        income_txns = sum(float(t.amount) for t in all_txns if t.type == 'Income')
        expense_txns = sum(float(t.amount) for t in all_txns if t.type == 'Expense')
        kpiCards = [
            {
                'title': 'Total Transactions',
                'value': str(len(all_txns)),
                'change': '+0%', 'trend': 'up', 'icon': 'receipt_long', 'iconBg': 'bg-blue-500/10', 'iconColor': 'text-blue-500', 'status': 'good'
            },
            {
                'title': 'Completed Payments',
                'value': format_indian_currency(completed_payments),
                'change': '+0%', 'trend': 'up', 'icon': 'check_circle', 'iconBg': 'bg-green-500/10', 'iconColor': 'text-green-500', 'status': 'good'
            },
            {
                'title': 'Pending Payments',
                'value': format_indian_currency(pending_payments),
                'change': '-0%', 'trend': 'down', 'icon': 'payments', 'iconBg': 'bg-orange-500/10', 'iconColor': 'text-orange-500', 'status': 'warning'
            },
            {
                'title': 'Total Billings (Cr.)',
                'value': format_indian_currency(income_txns),
                'change': '+0%', 'trend': 'up', 'icon': 'trending_up', 'iconBg': 'bg-teal-500/10', 'iconColor': 'text-teal-500', 'status': 'good'
            },
            {
                'title': 'Total Expenses (Dr.)',
                'value': format_indian_currency(expense_txns),
                'change': '-0%', 'trend': 'down', 'icon': 'trending_down', 'iconBg': 'bg-red-500/10', 'iconColor': 'text-red-500', 'status': 'warning'
            }
        ]
    elif role == 'Manager':
        kpiCards = [
            {
                'title': 'Active Trips',
                'value': str(active_trips_count),
                'change': '+0%', 'trend': 'up', 'icon': 'local_shipping', 'iconBg': 'bg-blue-500/10', 'iconColor': 'text-blue-500', 'status': 'good'
            },
            {
                'title': 'Fleet Availability',
                'value': f"{available_vehicles_count} / {vehicle_qs.count()} Avail",
                'change': '+0%', 'trend': 'up', 'icon': 'garage', 'iconBg': 'bg-green-500/10', 'iconColor': 'text-green-500', 'status': 'good'
            },
            {
                'title': 'Active Drivers',
                'value': str(active_drivers_count),
                'change': '+0%', 'trend': 'up', 'icon': 'badge', 'iconBg': 'bg-purple-500/10', 'iconColor': 'text-purple-500', 'status': 'good'
            },
            {
                'title': 'Pending Payments',
                'value': format_indian_currency(pending_payments),
                'change': '-0%', 'trend': 'down', 'icon': 'payments', 'iconBg': 'bg-orange-500/10', 'iconColor': 'text-orange-500', 'status': 'warning'
            },
            {
                'title': 'Under Maintenance',
                'value': str(vehicle_status_counts.get('Under Maintenance', 0)),
                'change': '-0%', 'trend': 'down', 'icon': 'build', 'iconBg': 'bg-red-500/10', 'iconColor': 'text-red-500', 'status': 'warning'
            }
        ]
    else:  # Admin / default
        kpiCards = [
            {
                'title': 'Total Vehicles',
                'value': str(vehicle_qs.count()),
                'change': '+0%', 'trend': 'up', 'icon': 'garage', 'iconBg': 'bg-blue-500/10', 'iconColor': 'text-blue-500', 'status': 'good'
            },
            {
                'title': 'Active Trips',
                'value': str(active_trips_count),
                'change': '+0%', 'trend': 'up', 'icon': 'local_shipping', 'iconBg': 'bg-green-500/10', 'iconColor': 'text-green-500', 'status': 'good'
            },
            {
                'title': 'Drivers on Duty',
                'value': str(active_drivers_count),
                'change': '+0%', 'trend': 'up', 'icon': 'badge', 'iconBg': 'bg-purple-500/10', 'iconColor': 'text-purple-500', 'status': 'good'
            },
            {
                'title': 'Pending Payments',
                'value': format_indian_currency(pending_payments),
                'change': '-0%', 'trend': 'down', 'icon': 'payments', 'iconBg': 'bg-orange-500/10', 'iconColor': 'text-orange-500', 'status': 'warning'
            },
            {
                'title': 'Monthly Profit',
                'value': format_indian_currency(monthly_profit),
                'change': '+0%' if monthly_profit >= 0 else '-0%',
                'trend': 'up' if monthly_profit >= 0 else 'down',
                'icon': 'trending_up' if monthly_profit >= 0 else 'trending_down',
                'iconBg': 'bg-green-500/10' if monthly_profit >= 0 else 'bg-red-500/10',
                'iconColor': 'text-green-500' if monthly_profit >= 0 else 'text-red-500',
                'status': 'good' if monthly_profit >= 0 else 'warning'
            }
        ]

    # 2. Trip Status Distribution
    trip_running = active_trips_count
    trip_completed = trip_status_counts.get('Completed', 0)
    trip_cancelled = trip_status_counts.get('Cancelled', 0) + trip_status_counts.get('Failed', 0)
    total_trips = trip_running + trip_completed + trip_cancelled
    
    tripStatusData = [
        { 'status': 'Running', 'count': trip_running, 'color': 'bg-blue-500', 'percentage': round((trip_running/total_trips)*100) if total_trips else 0 },
        { 'status': 'Completed', 'count': trip_completed, 'color': 'bg-green-500', 'percentage': round((trip_completed/total_trips)*100) if total_trips else 0 },
        { 'status': 'Cancelled', 'count': trip_cancelled, 'color': 'bg-red-500', 'percentage': round((trip_cancelled/total_trips)*100) if total_trips else 0 },
    ]
    
    # 3. Recent Trips (last 4) - OPTIMIZATION 3: select_related to prevent N+1 database queries
    recent_qs = user_trips.select_related('driver', 'vehicle').order_by('-added_date')[:4]
    recentTrips = []
    for t in recent_qs:
        color = 'bg-blue-100 text-blue-800'
        if t.status == 'Completed': color = 'bg-green-100 text-green-800'
        elif t.status == 'Cancelled': color = 'bg-red-100 text-red-800'
            
        recentTrips.append({
            'tripId': f"TMS{t.trip_id}",
            'vehicle': t.vehicle.vehicle_number if t.vehicle else 'Unassigned',
            'driver': t.driver.name if t.driver else 'Unassigned',
            'route': f"{t.start_location} → {t.end_location}",
            'status': t.status,
            'profit': format_indian_currency(t.distance * 10), 
            'statusColor': color
        })

    # 4. Expense Breakdown - OPTIMIZATION 4: Aggregate categories in-memory from pre-fetched transactions list
    cat_totals = {}
    for t in all_txns:
        if t.type == 'Expense':
            cat = t.category or 'Others'
            if cat.strip().lower().replace(' ', '') in ['freightexpence', 'freightexpense']:
                cat = 'Freight Expense'
            cat_totals[cat] = cat_totals.get(cat, 0.0) + float(t.amount)
            
    sorted_expenses = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)
    total_exp_all = sum(cat_totals.values()) or 1
    
    expenseBreakdown = []
    colors = ['from-red-500 to-red-400', 'from-blue-500 to-blue-400', 'from-yellow-500 to-yellow-400', 'from-green-500 to-green-400', 'from-purple-500 to-purple-400']
    
    top_n = sorted_expenses[:4]
    others_amt = sum(amt for cat, amt in sorted_expenses[4:])
    
    display_expenses = list(top_n)
    if others_amt > 0:
        others_index = next((i for i, (cat, _) in enumerate(display_expenses) if cat == 'Others'), -1)
        if others_index != -1:
            display_expenses[others_index] = ('Others', display_expenses[others_index][1] + others_amt)
        else:
            display_expenses.append(('Others', others_amt))
            
    for idx, (cat, amt) in enumerate(display_expenses):
        pct = round((amt / total_exp_all) * 100)
        expenseBreakdown.append({
            'category': cat,
            'amount': format_indian_currency(amt),
            'percentage': pct,
            'color': colors[idx % len(colors)]
        })

    # 5. Top Cost Heads
    topCostHeads = []
    for e in expenseBreakdown:
        topCostHeads.append({
            'name': e['category'],
            'amount': e['amount'],
            'percentage': e['percentage']
        })
        
    # 6. Monthly Financial
    import calendar
    monthlyFinancial = []
    for i in range(4, -1, -1):
        m = (current_month - i - 1) % 12 + 1
        y = current_year if m <= current_month else current_year - 1
        inc = sum(float(t.amount) for t in all_txns if t.type == 'Income' and t.date and t.date.month == m and t.date.year == y and t.status == 'Completed')
        exp = sum(float(t.amount) for t in all_txns if t.type == 'Expense' and t.date and t.date.month == m and t.date.year == y and t.status == 'Completed')
        monthlyFinancial.append({
            'month': calendar.month_abbr[m],
            'income': inc,
            'expenses': exp
        })

    # 7. Vehicle Alerts
    vehicleAlerts = []
    maintenance_vehicles = user_vehicles.filter(status='Under Maintenance')[:4]
    for v in maintenance_vehicles:
        vehicleAlerts.append({
            'type': 'Under Maintenance',
            'vehicle': v.vehicle_number or 'Unknown',
            'daysLeft': 0,
            'severity': 'high',
            'icon': 'build'
        })
        
    # 8. Activity Log - OPTIMIZATION 5: select_related on activity log queries to eliminate query amplification
    trip_logs_qs = user_trips.select_related('driver').order_by('-added_date')[:3]
    finance_logs_qs = user_finance.order_by('-added_date')[:3]
    logs = list(trip_logs_qs) + list(finance_logs_qs)
    
    logs.sort(key=lambda x: getattr(x, 'added_date', datetime.min) if getattr(x, 'added_date', None) else datetime.min, reverse=True)
    activityLog = []
    for obj in logs[:5]:
        if isinstance(obj, Trip):
            activityLog.append({
                'message': f"Trip TMS{obj.trip_id} created for {obj.driver.name if obj.driver else 'Unassigned'}",
                'time': obj.added_date.strftime("%b %d, %I:%M %p") if getattr(obj, 'added_date', None) else "Recently",
                'icon': 'local_shipping',
                'iconColor': 'text-blue-500',
            })
        else:
            activityLog.append({
                'message': f"New {obj.type} of {format_indian_currency(obj.amount)} recorded",
                'time': obj.added_date.strftime("%b %d, %I:%M %p") if getattr(obj, 'added_date', None) else "Recently",
                'icon': 'payments',
                'iconColor': 'text-green-500' if obj.type == 'Income' else 'text-red-500',
            })
            
    # 9. Notifications
    notifications = []
    pending_large = [t for t in all_txns if t.status == 'Pending' and float(t.amount) > 10000][:3]
    for p in pending_large:
        notifications.append({
            'title': 'High Pending Payment',
            'message': f"Pending {p.type} of {format_indian_currency(p.amount)} requires attention.",
            'severity': 'high',
            'time': p.added_date.strftime("%b %d, %I:%M %p") if getattr(p, 'added_date', None) else "Recently",
        })
    failed_trips = user_trips.filter(status='Failed')[:2]
    for ft in failed_trips:
         notifications.append({
            'title': 'Trip Failed Alert',
            'message': f"Trip TMS{ft.trip_id} has failed.",
            'severity': 'high',
            'time': ft.added_date.strftime("%b %d, %I:%M %p") if getattr(ft, 'added_date', None) else "Recently",
        })

    return Response({
        'kpiCards': kpiCards,
        'tripStatusData': tripStatusData,
        'recentTrips': recentTrips,
        'expenseBreakdown': expenseBreakdown,
        'totalTrips': total_trips,
        'monthlyFinancial': monthlyFinancial,
        'topCostHeads': topCostHeads,
        'vehicleAlerts': vehicleAlerts,
        'activityLog': activityLog,
        'notifications': notifications
    })

from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def admin_signup(request):
    import re
    data = request.data
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()
    role = data.get('role', 'Admin')
    
    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)
        
    if len(username) < 5:
        return Response({'error': 'Username must be at least 5 characters.'}, status=400)
        
    if len(username) > 30:
        return Response({'error': 'Username cannot exceed 30 characters.'}, status=400)
        
    if not re.match(r'^[a-zA-Z0-9_ ]+$', username):
        return Response({'error': 'Username can only contain letters, numbers, underscores, and spaces.'}, status=400)
        
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)
        
    if email:
        if len(email) > 50:
            return Response({'error': 'Email cannot exceed 50 characters.'}, status=400)
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return Response({'error': 'Please enter a valid email address.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists.'}, status=400)

    if not password or len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=400)
        
    user = User.objects.create_user(username=username, email=email, password=password)
    if role == 'Admin':
        user.is_staff = True
        user.is_superuser = True
    user.save()

    UserProfile.objects.create(user=user, role=role)
    
    if role == 'Driver':
        # Ensure we have a Driver database instance matching the signup username
        Driver.objects.create(
            name=username,
            phone='',
            license='PENDING',
            experience='0',
            city='Default',
            state='Default',
            dob='2000-01-01',
            status='Active'
        )
    
    return Response({'message': 'Admin user created successfully', 'username': username, 'role': role})

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def admin_login(request):
    from django.utils import timezone
    from datetime import timedelta
    
    data = request.data
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    # 1. Fetch User and check lockout status
    try:
        user_obj = User.objects.get(username=username)
        profile, created = UserProfile.objects.get_or_create(user=user_obj, defaults={'role': 'Admin'})
    except User.DoesNotExist:
        user_obj = None
        profile = None

    if profile and profile.locked_until and profile.locked_until > timezone.now():
        remaining_seconds = int((profile.locked_until - timezone.now()).total_seconds())
        remaining_minutes = max(1, (remaining_seconds + 59) // 60)
        return Response({
            'error': f'Account is temporarily blocked due to multiple failed login attempts. Please try again in {remaining_minutes} minute(s).'
        }, status=403)

    # 2. Authenticate
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Reset failed attempts on success
        if profile:
            profile.failed_login_attempts = 0
            profile.locked_until = None
            profile.save()
        else:
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={'role': 'Admin'})
        
        log_audit_event(f"Successful login for user: {username}")
        return Response({
            'message': 'Login successful',
            'username': user.username,
            'is_staff': user.is_staff,
            'role': profile.role
        })
    else:
        log_audit_event(f"Failed login attempt for user: {username}")
        if profile:
            profile.failed_login_attempts += 1
            if profile.failed_login_attempts >= 5:
                profile.locked_until = timezone.now() + timedelta(minutes=5)
                profile.save()
                return Response({
                    'error': 'Account is temporarily blocked due to multiple failed login attempts. Please try again in 5 minutes.'
                }, status=403)
            profile.save()
        
        return Response({'error': 'Invalid credentials'}, status=401)
