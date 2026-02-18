from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AlertViewSet,
    CategoryViewSet,
    ConsommationViewSet,
    NotificationViewSet,
    UserViewSet,
    activate_account,
    csrf,
    generate_consumptions,
    login,
    logout,
    register,
)


router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"consommations", ConsommationViewSet)
router.register(r"alerts", AlertViewSet)
router.register(r"notifications", NotificationViewSet)

urlpatterns = [
    path("csrf/", csrf, name="csrf"),
    path("register/", register, name="register"),
    path("activate/", activate_account, name="activate-account"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("generate-consumptions/", generate_consumptions, name="generate-consumptions"),
    path("", include(router.urls)),
]
