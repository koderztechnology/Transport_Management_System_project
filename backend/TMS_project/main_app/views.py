from rest_framework import viewsets
from .models import Vehicle, Trip, LRBilty, EWayBill, FinanceTransaction
from .serializers import VehicleSerializer, TripSerializer, LRBiltySerializer, EWayBillSerializer, FinanceTransactionSerializer
from .models import Vendor, Inventory, Tracking, SystemSetting
from .serializers import VendorSerializer, InventorySerializer, TrackingSerializer, SystemSettingSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by('-pk')[:300]
    serializer_class = VehicleSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-pk')[:300]
    serializer_class = TripSerializer

class LRBiltyViewSet(viewsets.ModelViewSet):
    queryset = LRBilty.objects.all().order_by('-pk')[:300]
    serializer_class = LRBiltySerializer

class EWayBillViewSet(viewsets.ModelViewSet):
    queryset = EWayBill.objects.all().order_by('-pk')[:300]
    serializer_class = EWayBillSerializer

class FinanceTransactionViewSet(viewsets.ModelViewSet):
    queryset = FinanceTransaction.objects.all().order_by('-pk')[:300]
    serializer_class = FinanceTransactionSerializer


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
    queryset = Inventory.objects.all().order_by('-pk')[:300]
    serializer_class = InventorySerializer

class TrackingViewSet(viewsets.ModelViewSet):
    queryset = Tracking.objects.all().order_by('-pk')[:300]
    serializer_class = TrackingSerializer

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

    if role == 'Driver' and username:
        trip_qs = trip_qs.filter(driver__name__icontains=username)
        finance_qs = FinanceTransaction.objects.none()
        vehicle_qs = vehicle_qs.filter(driver__name__icontains=username)
    elif role == 'Vendor' and username:
        finance_qs = finance_qs.filter(vendor__name__icontains=username)
        trip_qs = Trip.objects.none()
        vehicle_qs = Vehicle.objects.none()

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

    # 1. KPIs
    active_trips_count = trip_qs.filter(status__in=['In Progress', 'Running']).count()
    available_vehicles_count = vehicle_qs.filter(status='Available').count()
    active_drivers_count = driver_qs.filter(status='Active').count()
    
    # Financials
    pending_payments_agg = finance_qs.filter(status='Pending').aggregate(total=Sum('amount'))
    pending_payments = pending_payments_agg['total'] or 0
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    income_agg = finance_qs.filter(type='Income', date__month=current_month, date__year=current_year, status='Completed').aggregate(total=Sum('amount'))
    expense_agg = finance_qs.filter(type='Expense', date__month=current_month, date__year=current_year, status='Completed').aggregate(total=Sum('amount'))
    
    monthly_income = income_agg['total'] or 0
    monthly_expense = expense_agg['total'] or 0
    monthly_profit = float(monthly_income) - float(monthly_expense)
    
    kpiCards = [
        {
            'title': 'Active Trips',
            'value': str(active_trips_count),
            'change': '+0%', 'trend': 'up', 'icon': 'local_shipping', 'iconBg': 'bg-blue-500/10', 'iconColor': 'text-blue-500', 'status': 'good'
        },
        {
            'title': 'Available Vehicles',
            'value': str(available_vehicles_count),
            'change': '+0%', 'trend': 'up', 'icon': 'garage', 'iconBg': 'bg-green-500/10', 'iconColor': 'text-green-500', 'status': 'good'
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
            'change': '+0%', 'trend': 'up', 'icon': 'trending_up', 'iconBg': 'bg-green-500/10', 'iconColor': 'text-green-500', 'status': 'good'
        }
    ]
    
    # 2. Trip Status Distribution
    trip_running = active_trips_count
    trip_completed = trip_qs.filter(status='Completed').count()
    trip_cancelled = trip_qs.filter(status__in=['Cancelled', 'Failed']).count()
    total_trips = trip_running + trip_completed + trip_cancelled
    
    tripStatusData = [
        { 'status': 'Running', 'count': trip_running, 'color': 'bg-blue-500', 'percentage': round((trip_running/total_trips)*100) if total_trips else 0 },
        { 'status': 'Completed', 'count': trip_completed, 'color': 'bg-green-500', 'percentage': round((trip_completed/total_trips)*100) if total_trips else 0 },
        { 'status': 'Cancelled', 'count': trip_cancelled, 'color': 'bg-red-500', 'percentage': round((trip_cancelled/total_trips)*100) if total_trips else 0 },
    ]
    
    # 3. Recent Trips (last 4)
    recent_qs = trip_qs.order_by('-added_date')[:4]
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

    # 4. Expense Breakdown (Group and normalize category names to resolve misspelling)
    expenses_raw = finance_qs.filter(type='Expense').values('category').annotate(total=Sum('amount'))
    expenses_dict = {}
    for x in expenses_raw:
        cat = x['category'] or 'Others'
        # Normalize category names to handle misspelling
        if cat.strip().lower().replace(' ', '') in ['freightexpence', 'freightexpense']:
            cat = 'Freight Expense'
        expenses_dict[cat] = expenses_dict.get(cat, 0) + float(x['total'])
        
    sorted_expenses = sorted(expenses_dict.items(), key=lambda x: x[1], reverse=True)[:5]
    total_exp_all = sum(expenses_dict.values()) or 1
    
    expenseBreakdown = []
    colors = ['from-red-500 to-red-400', 'from-blue-500 to-blue-400', 'from-yellow-500 to-yellow-400', 'from-green-500 to-green-400', 'from-purple-500 to-purple-400']
    for idx, (cat, amt) in enumerate(sorted_expenses):
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
        inc = finance_qs.filter(type='Income', date__month=m, date__year=y, status='Completed').aggregate(total=Sum('amount'))['total'] or 0
        exp = finance_qs.filter(type='Expense', date__month=m, date__year=y, status='Completed').aggregate(total=Sum('amount'))['total'] or 0
        monthlyFinancial.append({
            'month': calendar.month_abbr[m],
            'income': float(inc),
            'expenses': float(exp)
        })

    # 7. Vehicle Alerts
    vehicleAlerts = []
    maintenance_vehicles = vehicle_qs.filter(status='Under Maintenance')[:4]
    for v in maintenance_vehicles:
        vehicleAlerts.append({
            'type': 'Under Maintenance',
            'vehicle': v.vehicle_number or 'Unknown',
            'daysLeft': 0,
            'severity': 'high',
            'icon': 'build'
        })
        
    # 8. Activity Log
    logs = list(trip_qs.order_by('-added_date')[:3]) + list(finance_qs.order_by('-added_date')[:3])
    # sort by added_date desc if present
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
    pending_large = finance_qs.filter(status='Pending', amount__gt=10000)[:3]
    for p in pending_large:
        notifications.append({
            'title': 'High Pending Payment',
            'message': f"Pending {p.type} of {format_indian_currency(p.amount)} requires attention.",
            'severity': 'high',
            'time': p.added_date.strftime("%b %d, %I:%M %p") if getattr(p, 'added_date', None) else "Recently",
        })
    failed_trips = trip_qs.filter(status='Failed')[:2]
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

from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_signup(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    role = data.get('role', 'Admin')
    
    if not username or not password:
        return Response({'error': 'Please provide username and password'}, status=400)
        
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
        
    user = User.objects.create_user(username=username, email=email, password=password)
    if role == 'Admin':
        user.is_staff = True
        user.is_superuser = True
    user.save()

    UserProfile.objects.create(user=user, role=role)
    
    return Response({'message': 'Admin user created successfully', 'username': username, 'role': role})

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Handle existing users that might not have a UserProfile
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
        return Response({'error': 'Invalid credentials'}, status=401)
