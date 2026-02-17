import json
import secrets

from django.contrib.auth import logout as django_logout
from django.contrib.auth.hashers import check_password, make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

from .models import Alert, Category, Consommation, Notification, User
from .serializers import (
    AlertSerializer,
    CategorySerializer,
    ConsommationSerializer,
    NotificationSerializer,
    UserSerializer,
)


@csrf_exempt
def register(request):
    """
    POST /api/v1/register/
    Auth: none
    Body: { "email": "...", "password": "..." }
    Returns: 201 + {id,email,is_active,message} | 409 | 400
    Description: Create a user account (inactive by default).
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON."}, status=400)

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return JsonResponse({"detail": "Email and password are required."}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"detail": "Email already registered."}, status=409)

    user = User.objects.create(
        email=email,
        password=make_password(password),
        is_active=False,
        role="user",
    )

    return JsonResponse(
        {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
            "message": "Registration successful. Please verify your email.",
        },
        status=201,
    )


def session_required(view_func):
    def _wrapped(request, *args, **kwargs):
        if _get_session_user_id(request) is None:
            return JsonResponse({"detail": "Authentication required."}, status=401)
        return view_func(request, *args, **kwargs)

    return _wrapped


@csrf_exempt
@session_required
def activate_account(request):
    """
    POST /api/v1/activate/
    Auth: session (login required)
    Body: { "email": "..." }
    Returns: 200 + {id,email,is_active} | 404 | 400
    Description: Activate an account (simulated email validation).
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON."}, status=400)

    email = (payload.get("email") or "").strip().lower()
    if not email:
        return JsonResponse({"detail": "Email is required."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({"detail": "User not found."}, status=404)

    if user.is_active:
        return JsonResponse({"detail": "Account already active."}, status=200)

    user.is_active = True
    user.save(update_fields=["is_active"])

    return JsonResponse(
        {"id": user.id, "email": user.email, "is_active": user.is_active},
        status=200,
    )


@csrf_exempt
def login(request):
    """
    POST /api/v1/login/
    Auth: none
    Body: { "email": "...", "password": "..." }
    Returns: 200 + {token,user{...}} | 403 | 401 | 400
    Description: Authenticate and return a token + user info.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON."}, status=400)

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return JsonResponse({"detail": "Email and password are required."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({"detail": "Invalid credentials."}, status=401)

    if not user.is_active:
        return JsonResponse({"detail": "Account not activated."}, status=403)

    if not check_password(password, user.password):
        return JsonResponse({"detail": "Invalid credentials."}, status=401)

    token = secrets.token_urlsafe(32)
    request.session["user_id"] = user.id
    request.session["auth_token"] = token

    return JsonResponse(
        {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
        },
        status=200,
    )


@csrf_exempt
@session_required
def logout(request):
    """
    POST /api/v1/logout/
    Auth: session (login required)
    Body: none
    Returns: 200 + {message} | 405
    Description: Destroy the current session.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed."}, status=405)

    django_logout(request)
    return JsonResponse({"message": "Logged out."}, status=200)


def _get_session_user_id(request):
    return request.session.get("user_id")


def _get_session_user(request):
    user_id = _get_session_user_id(request)
    if not user_id:
        return None
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


class SessionAuthenticated(BasePermission):
    """
    Permission: allow access only if the user is authenticated via session.
    """

    def has_permission(self, request, view):
        return _get_session_user_id(request) is not None


class UserViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/v1/users/
    GET/PUT/PATCH/DELETE /api/v1/users/{id}/
    Auth: none
    Body (POST/PUT/PATCH): User fields (email, password, is_active, role)
    Returns: User object(s)
    Description: CRUD for users.
    """
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [SessionAuthenticated]

    def get_queryset(self):
        user_id = _get_session_user_id(self.request)
        if not user_id:
            return User.objects.none()
        return User.objects.filter(id=user_id)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/v1/categories/
    GET/PUT/PATCH/DELETE /api/v1/categories/{id}/
    Auth: none
    Body (POST/PUT/PATCH): Category fields (name, unit)
    Returns: Category object(s)
    Description: CRUD for categories.
    """
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [SessionAuthenticated]


class ConsommationViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/v1/consommations/
    GET/PUT/PATCH/DELETE /api/v1/consommations/{id}/
    Auth: none
    Body (POST/PUT/PATCH): Consommation fields (user, category, value, price, date_consommation)
    Returns: Consommation object(s)
    Description: CRUD for consommation data.
    """
    queryset = Consommation.objects.select_related("user", "category").all()
    serializer_class = ConsommationSerializer
    permission_classes = [SessionAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        session_user_id = _get_session_user_id(self.request)
        if session_user_id:
            queryset = queryset.filter(user_id=session_user_id)

        consommation_id = self.request.query_params.get("id")
        category_id = self.request.query_params.get("category")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if consommation_id:
            queryset = queryset.filter(id=consommation_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if date_from:
            queryset = queryset.filter(date_consommation__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_consommation__date__lte=date_to)

        return queryset

    def perform_create(self, serializer):
        user = _get_session_user(self.request)
        if user is None:
            raise PermissionDenied("Authentication required.")
        serializer.save(user=user)


class AlertViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/v1/alerts/
    GET/PUT/PATCH/DELETE /api/v1/alerts/{id}/
    Auth: none
    Body (POST/PUT/PATCH): Alert fields (limit, status, message)
    Returns: Alert object(s)
    Description: CRUD for alert rules.
    """
    queryset = Alert.objects.all().order_by("-id")
    serializer_class = AlertSerializer
    permission_classes = [SessionAuthenticated]


class NotificationViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/v1/notifications/
    GET/PUT/PATCH/DELETE /api/v1/notifications/{id}/
    Auth: none
    Body (POST/PUT/PATCH): Notification fields (user, alert)
    Returns: Notification object(s)
    Description: CRUD for notifications.
    """
    queryset = Notification.objects.select_related("user", "alert").all()
    serializer_class = NotificationSerializer
    permission_classes = [SessionAuthenticated]
