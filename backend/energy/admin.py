from django.contrib import admin

from .models import Alert, Category, Consommation, Notification, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "is_active", "role", "created_at")
    list_filter = ("is_active", "role")
    search_fields = ("email",)
    ordering = ("-id",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "unit")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Consommation)
class ConsommationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "category", "value", "unit_price", "date_consommation")
    list_filter = ("category",)
    search_fields = ("user__email", "category__name")
    ordering = ("-date_consommation",)


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "category", "limit", "status", "message")
    list_filter = ("status", "category")
    search_fields = ("message", "user__email", "category__name")
    ordering = ("-id",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "alert", "type", "read", "created_at")
    list_filter = ("created_at", "read", "type")
    search_fields = ("user__email", "alert__message")
    ordering = ("-created_at",)
