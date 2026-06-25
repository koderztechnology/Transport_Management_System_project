import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TMS_project.settings")
django.setup()

from main_app.models import FinanceTransaction

if __name__ == "__main__":
    try:
        print(list(FinanceTransaction.objects.all()[:1]))
        print("Success: Can read from finance_transaction after model updates.")
    except Exception as e:
        import traceback
        traceback.print_exc()
