from django.db import models
from decimal import Decimal, ROUND_HALF_UP


class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    role = models.CharField(max_length=50, default="user")

    def __str__(self) -> str:
        return self.email


class Category(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)

    def __str__(self) -> str:
        return self.name


class Consommation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="consommations")
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="consommations"
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=4)
    date_consommation = models.DateTimeField()

    @property
    def total_price(self) -> Decimal:
        # Monetary values are rounded to 2 decimals for display/reporting.
        return (self.value * self.unit_price).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

    def __str__(self) -> str:
        return f"{self.user.email} - {self.category.name}"


class Alert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="alerts"
    )
    limit = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=30, default="active")
    message = models.CharField(max_length=255)

    def __str__(self) -> str:
        return f"{self.user.email} - {self.category.name} - {self.message}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    alert = models.OneToOneField(
        Alert, on_delete=models.CASCADE, related_name="notification"
    )
    type = models.CharField(max_length=30, default="alert")
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.email} - {self.alert.message}"
