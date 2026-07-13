from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from main_app.models import UserProfile

class AdminAuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.signup_url = '/api/signup/'
        self.login_url = '/api/login/'

    def test_signup_validation_success(self):
        response = self.client.post(self.signup_url, {
            'username': 'new_admin',
            'password': 'password123',
            'email': 'new@example.com',
            'role': 'Admin'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(username='new_admin').exists())
        self.assertEqual(User.objects.get(username='new_admin').profile.role, 'Admin')

    def test_signup_invalid_username(self):
        # Username too short
        response = self.client.post(self.signup_url, {
            'username': 'abcd',
            'password': 'password123',
            'email': 'ab@example.com'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Username must be at least 5 characters', response.json()['error'])

        # Username has special characters (should fail validation because we enforce alphanumeric/underscore/spaces)
        response = self.client.post(self.signup_url, {
            'username': 'user@name',
            'password': 'password123',
            'email': 'special@example.com'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_signup_duplicate_email(self):
        # Create an existing user with email
        User.objects.create_user(username='existing_user', email='test@example.com', password='password123')
        
        # Try to register another user with the same email
        response = self.client.post(self.signup_url, {
            'username': 'another_user',
            'password': 'password123',
            'email': 'test@example.com'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['error'], 'Email already exists.')

    def test_login_success(self):
        user = User.objects.create_user(username='login_test', email='test@example.com', password='password123')
        UserProfile.objects.create(user=user, role='Admin')

        response = self.client.post(self.login_url, {
            'username': 'login_test',
            'password': 'password123'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['message'], 'Login successful')

    def test_login_lockout_mechanism(self):
        user = User.objects.create_user(username='lock_test', email='test@example.com', password='password123')
        UserProfile.objects.create(user=user, role='Admin')

        # 4 failed attempts should not lock
        for _ in range(4):
            response = self.client.post(self.login_url, {
                'username': 'lock_test',
                'password': 'wrong_password'
            }, content_type='application/json')
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()['error'], 'Invalid credentials')

        # 5th failed attempt locks the account
        response = self.client.post(self.login_url, {
            'username': 'lock_test',
            'password': 'wrong_password'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertIn('temporarily blocked', response.json()['error'])

        # Next attempts, even with correct password, are blocked
        response = self.client.post(self.login_url, {
            'username': 'lock_test',
            'password': 'password123'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertIn('temporarily blocked', response.json()['error'])

from main_app.serializers import (
    DriverSerializer, FuelSerializer, TollSerializer, VehicleSerializer,
    LRBiltySerializer, EWayBillSerializer, FinanceTransactionSerializer, VendorSerializer
)
from datetime import date, timedelta
from unittest.mock import patch, MagicMock

class SerializerValidationTests(TestCase):
    @patch('main_app.models.Driver.objects.filter')
    def test_driver_serializer_phone_validation(self, mock_filter):
        mock_qs = MagicMock()
        mock_qs.exclude.return_value = mock_qs
        mock_qs.exists.return_value = False
        mock_filter.return_value = mock_qs

        # Invalid phone
        serializer = DriverSerializer(data={'name': 'Rajesh', 'phone': '12345'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone', serializer.errors)
        self.assertEqual(serializer.errors['phone'][0], "Phone number must be exactly 10 digits.")

        # Valid phone
        serializer = DriverSerializer(data={'name': 'Rajesh', 'phone': '9876543210'})
        self.assertTrue(serializer.is_valid())

    def test_fuel_serializer_price_and_litres_validation(self):
        # Negative litres
        serializer = FuelSerializer(data={'litres': -10.5, 'price_per_litre': 95.5, 'date': '2026-07-03'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('litres', serializer.errors)
        self.assertEqual(serializer.errors['litres'][0], "Litres must be greater than zero.")

        # Negative price
        serializer = FuelSerializer(data={'litres': 50.0, 'price_per_litre': -5.0, 'date': '2026-07-03'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('price_per_litre', serializer.errors)
        self.assertEqual(serializer.errors['price_per_litre'][0], "Price per litre must be greater than zero.")

    def test_toll_serializer_amount_validation(self):
        # Zero amount
        serializer = TollSerializer(data={'toll_name': 'Plaza A', 'amount': 0.0, 'date': '2026-07-03'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('amount', serializer.errors)
        self.assertEqual(serializer.errors['amount'][0], "Amount must be greater than zero.")

    @patch('main_app.models.LRBilty.objects.filter')
    def test_lr_bilty_serializer_weight_and_date(self, mock_filter):
        mock_qs = MagicMock()
        mock_qs.exclude.return_value = mock_qs
        mock_qs.exists.return_value = False
        mock_filter.return_value = mock_qs

        # Future date
        future_date = (date.today() + timedelta(days=2)).isoformat()
        serializer = LRBiltySerializer(data={'lr_number': 'LR-001', 'date': future_date, 'weight': 100, 'freight': 500})
        self.assertFalse(serializer.is_valid())
        self.assertIn('date', serializer.errors)
        self.assertEqual(serializer.errors['date'][0], "Date cannot be in the future.")

        # Negative weight
        serializer = LRBiltySerializer(data={'lr_number': 'LR-002', 'date': date.today().isoformat(), 'weight': -10, 'freight': 500})
        self.assertFalse(serializer.is_valid())
        self.assertIn('weight', serializer.errors)

    @patch('main_app.models.EWayBill.objects.filter')
    def test_eway_bill_serializer_gstin_and_estimated_days(self, mock_filter):
        mock_qs = MagicMock()
        mock_qs.exclude.return_value = mock_qs
        mock_qs.exists.return_value = False
        mock_filter.return_value = mock_qs

        # Invalid GSTIN format
        serializer = EWayBillSerializer(data={'supplier_gstin': 'ABCDE1234F', 'buyer_gstin': '27ABCDE1234F1Z5', 'invoice_amount': 1000})
        self.assertFalse(serializer.is_valid())
        self.assertIn('supplier_gstin', serializer.errors)

        # Invalid estimated days
        serializer = EWayBillSerializer(data={'supplier_gstin': '27ABCDE1234F1Z5', 'buyer_gstin': '27ABCDE1234F1Z5', 'invoice_amount': 1000, 'estimated_days': -1})
        self.assertFalse(serializer.is_valid())
        self.assertIn('estimated_days', serializer.errors)

    def test_finance_transaction_date_and_description(self):
        # Invalid description with numbers/special chars
        serializer = FinanceTransactionSerializer(data={'date': '2025-05-15', 'amount': 1500, 'description': 'Ref #123!'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('description', serializer.errors)

        # Historical date before Jan 1, 2025
        serializer = FinanceTransactionSerializer(data={'date': '2024-12-31', 'amount': 1500, 'description': 'Standard payment'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('date', serializer.errors)

    @patch('main_app.models.Vendor.objects.filter')
    def test_vendor_serializer_email(self, mock_filter):
        mock_qs = MagicMock()
        mock_qs.exclude.return_value = mock_qs
        mock_qs.exists.return_value = False
        mock_filter.return_value = mock_qs

        # Invalid email format
        serializer = VendorSerializer(data={'name': 'Vendor Corp', 'email': 'not-an-email'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

