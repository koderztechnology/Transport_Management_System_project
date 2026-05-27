import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TMS_project.settings")
django.setup()

try:
    with connection.cursor() as cursor:
        cursor.execute("ALTER TABLE finance_transaction ADD COLUMN vehicle_id INT DEFAULT NULL, ADD COLUMN trip_id INT DEFAULT NULL, ADD COLUMN vendor_id INT DEFAULT NULL;")
    print("Columns added successfully")
except Exception as e:
    print(f"Error: {e}")
