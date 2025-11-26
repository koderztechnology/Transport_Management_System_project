from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

class InventoryItem(models.Model):
    """
    Corresponds to the 'stockItems' state in your React component.
    """
    CATEGORY_CHOICES = [
        ('Tyres', 'Tyres'),
        ('Oils', 'Oils'),
        ('Spare Parts', 'Spare Parts'),
        ('Tools', 'Tools'),
        ('Misc', 'Misc'),
    ]

    inventory_item_id = models.AutoField(primary_key=True)

    inventory_item_name = models.CharField(max_length=200, help_text="e.g., MRF Radial Tyres")
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='Misc'
    )
    quantity = models.CharField(
        max_length=100,
    )
    unit = models.CharField(max_length=20, help_text="e.g., Nos, Ltr, Set")
    reorder_level = models.CharField(
        max_length=100,
    )
    
    # Timestamps for record keeping
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class IssueLog(models.Model):
    """
    Corresponds to the 'issueLog' state.
    This tracks items leaving the inventory.
    """
    # Relationship to InventoryItem (Foreign Key)
    # on_delete=models.PROTECT prevents deleting an item if it has issue logs
    issue_log_id = models.AutoField(primary_key=True)
    inventory_item_id = models.ForeignKey(
        InventoryItem, 
        on_delete=models.PROTECT, 
        related_name='issue_logs'
    )
    
    quantity_issued = models.CharField(max_length=100)
    
    issued_to = models.CharField(
        max_length=100, 
    )
    
    vehicle_number = models.CharField(
        max_length=50, 
        help_text="Vehicle Registration, e.g., MH12AB3456"
    )
    
    date_issued = models.DateField(default=timezone.now)

