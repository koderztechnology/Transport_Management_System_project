import os
import django
from datetime import date, datetime, timedelta
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TMS_project.settings")
django.setup()

from main_app.models import (
    Driver, Vehicle, Vendor, Trip, Fuel, Toll,
    LRBilty, EWayBill, FinanceTransaction, Inventory,
    Tracking, SystemSetting
)

from django.db import connection

def seed():
    print("Seeding database...")
    with connection.cursor() as cursor:
        cursor.execute("PRAGMA foreign_keys = OFF;")
    
    # 1. System Settings
    if not SystemSetting.objects.exists():
        SystemSetting.objects.create(key="Company Name", value="TMS Pro Transport", description="Main company name")
        SystemSetting.objects.create(key="Tax Rate", value="18%", description="Standard tax rate")
        SystemSetting.objects.create(key="Currency", value="INR", description="Default system currency")
        print("Created System Settings")

    # 2. Vendors
    vendors = []
    if not Vendor.objects.exists():
        vendor_data = [
            ("Reliance Fuel", "Fuel", "Rajesh Kumar", "+91 98765 43210", "reliance@fuel.com", "Mumbai, Maharashtra"),
            ("Speedy Maintenance", "Maintenance", "Amit Sharma", "+91 98765 43211", "speedy@maint.com", "Delhi NCR"),
            ("NHAI Toll Authority", "Toll", "Sanjay Singh", "+91 98765 43212", "nhai@toll.gov.in", "National Highways"),
            ("MRF Tyres", "Maintenance", "Vikram Patel", "+91 98765 43213", "mrf@tyres.com", "Chennai, Tamil Nadu"),
            ("Tata Motors Service", "Maintenance", "Ramesh Verma", "+91 98765 43214", "tata@service.com", "Pune, Maharashtra")
        ]
        for name, st, cp, ph, em, ad in vendor_data:
            v = Vendor.objects.create(
                name=name, service_type=st, contact_person=cp,
                phone=ph, email=em, address=ad, status="Active"
            )
            vendors.append(v)
        print(f"Created {len(vendors)} Vendors")
    else:
        vendors = list(Vendor.objects.all())

    # 3. Drivers
    drivers = []
    if not Driver.objects.exists():
        driver_data = [
            ("Ramesh Yadav", "DL-1234567890", "+91 98989 89890", "10 Years", "Delhi", "Active"),
            ("Suresh Kumar", "MH-9876543210", "+91 98989 89891", "8 Years", "Mumbai", "Active"),
            ("Gurpreet Singh", "PB-5555444433", "+91 98989 89892", "12 Years", "Ludhiana", "Active"),
            ("Vijay Mhatre", "MH-1111222233", "+91 98989 89893", "5 Years", "Pune", "Active"),
            ("Karan Sharma", "HR-7777888899", "+91 98989 89894", "6 Years", "Gurugram", "Active")
        ]
        for name, lic, ph, exp, city, status in driver_data:
            d = Driver.objects.create(
                name=name, license=lic, phone=ph, altPhone="+91 90000 00000",
                experience=exp, address=f"Street 1, {city}", state="State",
                city=city, aadhar="1234 5678 9012", dob=date(1985, 5, 10),
                age=41, medical="Fit", maritalStatus="Married",
                nationality="Indian", jobType="Full-time", status=status
            )
            drivers.append(d)
        print(f"Created {len(drivers)} Drivers")
    else:
        drivers = list(Driver.objects.all())

    # 4. Vehicles
    vehicles = []
    if not Vehicle.objects.exists():
        vehicle_data = [
            ("DL-01-A-1234", "Tata", "Prima 4923.S", "40 Tons", drivers[0]),
            ("MH-02-B-5678", "Leyland", "U-4923", "35 Tons", drivers[1]),
            ("PB-03-C-9999", "Mahindra", "Blazo X 49", "45 Tons", drivers[2]),
            ("MH-12-Q-7777", "Tata", "Signa 4825.T", "30 Tons", drivers[3]),
            ("HR-55-Y-2222", "Eicher", "Pro 8049", "38 Tons", drivers[4])
        ]
        for num, make, model, cap, driver in vehicle_data:
            v = Vehicle.objects.create(
                vehicle_number=num, make=make, model=model,
                capacity=cap, driver=driver, status="Available"
            )
            vehicles.append(v)
        print(f"Created {len(vehicles)} Vehicles")
    else:
        vehicles = list(Vehicle.objects.all())

    # 5. Trips
    trips = []
    if not Trip.objects.exists():
        trip_data = [
            (vehicles[0], drivers[0], "Delhi", "Mumbai", 1400.0, 320.0, "Completed"),
            (vehicles[1], drivers[1], "Mumbai", "Bangalore", 1000.0, 240.0, "In Progress"),
            (vehicles[2], drivers[2], "Ludhiana", "Delhi", 320.0, 75.0, "Scheduled"),
            (vehicles[3], drivers[3], "Mumbai", "Pune", 150.0, 35.0, "Completed"),
            (vehicles[4], drivers[4], "Delhi", "Jaipur", 270.0, 60.0, "In Progress")
        ]
        for vehicle, driver, start_loc, end_loc, dist, fuel, status in trip_data:
            start_time = datetime.now() - timedelta(days=random.randint(1, 10))
            end_time = start_time + timedelta(days=2) if status == "Completed" else None
            t = Trip.objects.create(
                vehicle=vehicle, driver=driver, start_location=start_loc,
                end_location=end_loc, start_time=start_time, end_time=end_time,
                status=status, distance=dist, fuel_consumed=fuel
            )
            trips.append(t)
        print(f"Created {len(trips)} Trips")
    else:
        trips = list(Trip.objects.all())

    # 6. Fuel Transactions
    if not Fuel.objects.exists():
        for i, vehicle in enumerate(vehicles):
            Fuel.objects.create(
                vehicle=vehicle, litres=random.randint(50, 150),
                price_per_litre=95.50, date=date.today() - timedelta(days=i)
            )
        print("Created Fuel Transactions")

    # 7. Toll Transactions
    if not Toll.objects.exists():
        for i, vehicle in enumerate(vehicles):
            Toll.objects.create(
                vehicle=vehicle, toll_name=f"National Toll Plaza {i+1}",
                amount=random.randint(250, 750), date=date.today() - timedelta(days=i)
            )
        print("Created Toll Transactions")

    # 8. LR Bilty
    lr_bilties = []
    if not LRBilty.objects.exists():
        for i in range(5):
            lr = LRBilty.objects.create(
                lr_number=f"LR-{10000+i}", date=date.today() - timedelta(days=i),
                consignor=f"Consignor Pvt Ltd {i+1}", consignee=f"Consignee Logistics {i+1}",
                route=f"Route {i+1}", vehicle=vehicles[i], driver=drivers[i],
                material="Steel Coils" if i%2==0 else "Automobile Parts",
                weight="25 Tons", freight=str(15000 + i*2000), eway_bill=f"EWB-{999000+i}",
                status="Pending" if i%2==0 else "In-Transit"
            )
            lr_bilties.append(lr)
        print(f"Created {len(lr_bilties)} LR Bilty records")
    else:
        lr_bilties = list(LRBilty.objects.all())

    # 9. EWay Bills
    EWayBill.objects.all().delete()
    for i in range(5):
        EWayBill.objects.create(
            invoice_number=f"INV-2026-{200+i}", lr=lr_bilties[i],
            supplier_name=f"Supplier Metal Corp {i+1}", supplier_gstin=f"07AAAAA0000A1Z{i}",
            buyer_name=f"Buyer Auto Ltd {i+1}", buyer_gstin=f"27BBBBB1111B2Z{i}",
            goods_description="Steel Sheets" if i%2==0 else "Engine Parts",
            hsn_code=f"7208{i}", invoice_amount=str(150000 + i*50000),
            vehicle=vehicles[i], route_from="Source City", route_to="Destination City",
            estimated_days=3, driver=drivers[i], driver_phone=drivers[i].phone,
            status="Active"
        )
    print("Created EWay Bills")

    # 10. Finance Transactions
    FinanceTransaction.objects.all().delete()
    for i in range(10):
        t_type = "Income" if i % 2 == 0 else "Expense"
        cat = "Freight Income" if t_type == "Income" else ("Fuel" if i % 3 == 0 else "Toll")
        desc = f"Received freight payment for LR-{10000+(i//2)}" if t_type == "Income" else f"Paid {cat} charge"
        status = "Pending" if i in [3, 7] else "Completed"
        FinanceTransaction.objects.create(
            date=date.today(), type=t_type,
            description=desc, amount=float(25000 - i*1500) if t_type == "Income" else float(5000 + i*500),
            status=status, category=cat,
            vehicle=vehicles[i%5], trip=trips[i%5], vendor=vendors[i%5]
        )
    print("Created Finance Transactions")

    # 11. Inventory
    if not Inventory.objects.exists():
        items = [
            ("Truck Tyres 10.00R20", "Tyres", 20, 18000.0, 5, vendors[3]),
            ("Engine Oil 15W40", "Lubricants", 50, 450.0, 10, vendors[4]),
            ("Hydraulic Jack 20T", "Tools", 5, 2500.0, 2, vendors[1]),
            ("Air Filters", "Spares", 15, 850.0, 5, vendors[4]),
            ("Brake Linings", "Spares", 30, 1200.0, 8, vendors[1])
        ]
        for name, cat, qty, price, reorder, vendor in items:
            Inventory.objects.create(
                name=name, category=cat, quantity=qty, unit_price=price,
                reorder_level=reorder, vendor=vendor, status="In Stock"
            )
        print("Created Inventory Items")

    # 12. Tracking Logs
    if not Tracking.objects.exists():
        locs = [
            ("Delhi Border Toll", 28.7041, 77.1025),
            ("Jaipur Highway Plaza", 26.9124, 75.7873),
            ("Ahmedabad Bypass", 23.0225, 72.5714),
            ("Mumbai Expressway Entry", 19.0760, 72.8777),
            ("Bangalore Outer Ring Road", 12.9716, 77.5946)
        ]
        for i, vehicle in enumerate(vehicles):
            loc = locs[i % len(locs)]
            Tracking.objects.create(
                vehicle=vehicle, current_location=loc[0],
                latitude=loc[1], longitude=loc[2], speed=float(45 + i*5),
                status="Moving"
            )
        print("Created Tracking Logs")

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
