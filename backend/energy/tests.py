from django.test import TestCase
from django.utils import timezone
from decimal import Decimal

from .models import Category, Consommation, User


class UserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create(
            email="test_user@managenergy.local",
            password="Password123",
            is_active=True,
            role="user",
        )

        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, "test_user@managenergy.local")
        self.assertTrue(user.is_active)
        self.assertEqual(user.role, "user")


class ConsommationModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email="conso@managenergy.local",
            password="Password123",
            is_active=True,
            role="user",
        )
        self.category = Category.objects.create(name="Electricite", unit="kWh")

    def test_create_consommation(self):
        consommation = Consommation.objects.create(
            user=self.user,
            category=self.category,
            value=Decimal("42.50"),
            unit_price=Decimal("0.1800"),
            date_consommation=timezone.now(),
        )

        self.assertIsNotNone(consommation.id)
        self.assertEqual(consommation.user, self.user)
        self.assertEqual(consommation.category, self.category)
        self.assertEqual(consommation.value, Decimal("42.50"))
        self.assertEqual(consommation.unit_price, Decimal("0.1800"))

    def test_total_price_calculation_for_100_times_0_02(self):
        consommation = Consommation.objects.create(
            user=self.user,
            category=self.category,
            value=Decimal("100"),
            unit_price=Decimal("0.02"),
            date_consommation=timezone.now(),
        )

        self.assertEqual(consommation.total_price, Decimal("2.00"))
