from rest_framework import serializers

from .models import Alert, Category, Consommation, Notification, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "password", "created_at", "is_active", "role"]
        extra_kwargs = {"password": {"write_only": True}}


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "unit"]


class ConsommationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consommation
        fields = [
            "id",
            "user",
            "category",
            "value",
            "price",
            "date_consommation",
        ]
        extra_kwargs = {"user": {"read_only": True}}


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ["id", "user", "category", "limit", "status", "message"]
        extra_kwargs = {"user": {"read_only": True}}


class NotificationSerializer(serializers.ModelSerializer):
    def validate_alert(self, alert):
        if getattr(alert, "status", "").lower() == "inactive":
            raise serializers.ValidationError(
                "Cannot attach an inactive alert to a notification."
            )
        return alert

    class Meta:
        model = Notification
        fields = ["id", "user", "alert", "created_at"]
        extra_kwargs = {"user": {"read_only": True}}
