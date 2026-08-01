from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import login_direct, send_signup_otp, signup_verify, check_available_roles, get_user_profile, EmployeeViewSet, AttendanceViewSet, LeaveRequestViewSet, SalaryHistoryViewSet, AppreciationViewSet

router = DefaultRouter()
router.register(r'users', EmployeeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leaves', LeaveRequestViewSet)
router.register(r'salaries', SalaryHistoryViewSet)
router.register(r'appreciations', AppreciationViewSet)

urlpatterns = [
    path('auth/login-direct/', login_direct, name='login_direct'),
    path('auth/send-signup-otp/', send_signup_otp, name='send_signup_otp'),
    path('auth/signup-verify/', signup_verify, name='signup_verify'),
    path('auth/check-roles/', check_available_roles, name='check_available_roles'),
    path('auth/profile/', get_user_profile, name='get_user_profile'),
    path('', include(router.urls)),
]
