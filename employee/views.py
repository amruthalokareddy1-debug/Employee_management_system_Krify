from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
import random
import datetime
from django.utils import timezone

from .models import EmployeeProfile, Attendance, LeaveRequest, SalaryHistory, Appreciation, CompanyMilestone, Notification
from .serializers import (
    UserSerializer, AttendanceSerializer, LeaveRequestSerializer, 
    SalaryHistorySerializer, AppreciationSerializer, CompanyMilestoneSerializer, NotificationSerializer
)


# ===================== SIGNUP FLOW (OTP) =====================
@api_view(['POST'])
@permission_classes([AllowAny])
def send_signup_otp(request):
    email = request.data.get('email')
    role = request.data.get('role')

    if not email or not role:
        return Response({'error': 'Email and Role are required'}, status=400)

    if role not in ['hr', 'ceo']:
        return Response({'error': 'Only HR and CEO can sign up manually'}, status=403)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'User already exists'}, status=400)

    if role == 'ceo' and EmployeeProfile.objects.filter(role='ceo').exists():
        return Response({'error': 'CEO already exists'}, status=400)
    
    if role == 'hr' and EmployeeProfile.objects.filter(role='hr').exists():
        return Response({'error': 'HR already exists'}, status=400)

    otp_code = str(random.randint(100000, 999999))
    from .models import SignupOTP
    SignupOTP.objects.update_or_create(email=email, defaults={'otp': otp_code, 'created_at': timezone.now()})
    return Response({'message': 'OTP sent', 'otp': otp_code})

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_verify(request):
    name = request.data.get('name')
    email = request.data.get('email')
    role = request.data.get('role')
    otp = request.data.get('otp')

    if not all([name, email, role, otp]):
        return Response({'error': 'All fields are required'}, status=400)

    from .models import SignupOTP
    record = SignupOTP.objects.filter(email=email, otp=otp).first()

    if not record or not record.is_valid():
        return Response({'error': 'Invalid or expired OTP'}, status=400)

    user = User.objects.create_user(username=email, email=email, first_name=name)
    EmployeeProfile.objects.create(user=user, role=role.lower(), is_approved=True)
    record.delete()
    return Response({'success': 'User registered. Please login.'})

# ===================== DIRECT LOGIN =====================
@api_view(['POST'])
@permission_classes([AllowAny])
def login_direct(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    role = request.data.get('role', '').strip()

    if not all([email, name, role]):
        return Response({'error': 'Name, Email and Role are required'}, status=400)

    # Case-insensitive email search
    user = User.objects.filter(email__iexact=email).first()

    if not user:
        return Response({'error': f'No user found with email: {email}'}, status=404)

    profile = user.employee_profile

    # Robust name matching
    typed_name = name.lower()
    first_name = user.first_name.lower()
    last_name = user.last_name.lower()
    full_name = f"{first_name} {last_name}".strip()
    
    # Check if typed name matches first name, username, or full name
    name_matches = (typed_name == first_name) or \
                   (typed_name == user.username.lower()) or \
                   (typed_name == full_name) or \
                   (first_name in typed_name) # Allow "Amrutha Lokareddy" to match "Amrutha"
    
    if not name_matches:
        return Response({'error': f'Name "{name}" does not match our records for {email}'}, status=403)
    
    # Map frontend role values to backend keys
    role_map = {
        'hr manager': 'hr',
        'ceo': 'ceo',
        'employee': 'employee',
        'hr': 'hr' # Handle case where 'hr' is sent directly
    }
    typed_role = role_map.get(role.lower(), role.lower())
    
    if profile.role.lower() != typed_role:
        return Response({'error': f'Role mismatch. Your account is registered as {profile.role}, but you selected {role}'}, status=403)

    # Increment login version to invalidate previous sessions
    profile.login_version += 1
    profile.save()

    refresh = RefreshToken.for_user(user)
    refresh['login_version'] = profile.login_version

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_available_roles(request):
    ceo_exists = EmployeeProfile.objects.filter(role='ceo').exists()
    hr_exists = EmployeeProfile.objects.filter(role='hr').exists()
    
    available = []
    if not ceo_exists: available.append('ceo')
    if not hr_exists: available.append('hr')
    
    return Response({'available_roles': available})

# ===================== USER PROFILE =====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ===================== EMPLOYEE VIEW =====================
class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        user = self.request.user
        role = user.employee_profile.role

        if role == 'hr':
            # HR only sees employees
            return User.objects.filter(employee_profile__role='employee')
        if role == 'ceo':
            # CEO sees HR and Employees, but NOT other CEOs
            return User.objects.filter(employee_profile__role__in=['hr', 'employee'])

        return User.objects.filter(id=user.id)

    def destroy(self, request, *args, **kwargs):
        # Explicitly check for HR/CEO permission to delete
        if request.user.employee_profile.role not in ['hr', 'ceo']:
            return Response({'error': 'Unauthorized'}, status=403)
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Admin action: HR/CEO adding staff
        if request.user.employee_profile.role not in ['hr', 'ceo']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        email = request.data.get('email')
        full_name = request.data.get('first_name', '')
        role = request.data.get('role', 'employee')
        dept = request.data.get('department', 'Engineering')
        salary = request.data.get('current_salary', 0)

        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            return Response({'error': f'User with email {email} already exists.'}, status=400)

        # Handle splitting name into first/last
        names = full_name.split(' ', 1)
        f_name = names[0]
        l_name = names[1] if len(names) > 1 else ''

        # Create user with email as username
        user = User.objects.create_user(
            username=email, 
            email=email, 
            first_name=f_name,
            last_name=l_name,
            password='Password123!' # Default password
        )
        
        # Create profile
        profile = EmployeeProfile.objects.create(
            user=user, 
            role=role, 
            department=dept, 
            current_salary=salary,
            is_approved=True
        )

        # Create initial salary history
        SalaryHistory.objects.create(user=user, amount=salary)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.employee_profile.role != 'hr':
            return Response({'error': 'Only HR can approve employees'}, status=status.HTTP_403_FORBIDDEN)

        user_to_approve = self.get_object()
        profile = user_to_approve.employee_profile

        profile.is_approved = True

        role = request.data.get('role', 'employee')
        if role in ['employee', 'hr', 'ceo']:
            profile.role = role

        profile.save()

        return Response({'status': 'Employee approved'})


# ===================== ATTENDANCE =====================
class AttendanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer
    queryset = Attendance.objects.all()

    def get_queryset(self):
        user = self.request.user
        role = user.employee_profile.role
        if role in ['hr', 'ceo']:
            return Attendance.objects.all()
        return Attendance.objects.filter(user=user)

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        user = request.user
        today = datetime.date.today()
        attendance, created = Attendance.objects.get_or_create(user=user, date=today)
        attendance.check_in_time = datetime.datetime.now().time()
        attendance.save()
        return Response(AttendanceSerializer(attendance).data)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        user = request.user
        today = datetime.date.today()
        attendance = Attendance.objects.filter(user=user, date=today).first()
        if attendance:
            attendance.check_out_time = datetime.datetime.now().time()
            attendance.save()
            return Response(AttendanceSerializer(attendance).data)
        return Response({'error': 'No check-in found for today'}, status=400)


# ===================== LEAVE =====================
class LeaveRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaveRequestSerializer
    queryset = LeaveRequest.objects.all()

    def get_queryset(self):
        user = self.request.user
        role = user.employee_profile.role
        if role in ['hr', 'ceo']:
            return LeaveRequest.objects.all()
        return LeaveRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        # Mandatory reason check
        reason = self.request.data.get('reason')
        if not reason or len(reason.strip()) < 5:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'reason': 'Please provide a valid reason for leave.'})
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        leave = self.get_object()
        user_role = request.user.employee_profile.role
        target_role = leave.user.employee_profile.role

        # HR can only approve Employee leaves
        if user_role == 'hr' and target_role != 'employee':
            return Response({'error': 'HR can only approve employee leaves. CEO must approve HR leaves.'}, status=403)
        
        # CEO can approve anyone
        if user_role not in ['hr', 'ceo']:
            return Response({'error': 'Unauthorized'}, status=403)

        leave.status = request.data.get('status')
        leave.save()

        if leave.status == 'approved':
            profile = leave.user.employee_profile
            # Calculate total days (inclusive)
            delta = leave.end_date - leave.start_date
            days = delta.days + 1
            profile.leaves_balance = max(0, profile.leaves_balance - days)
            profile.save()
            
            # Send notification
            Notification.objects.create(
                user=leave.user,
                message=f"Your leave request ({leave.start_date} to {leave.end_date}) has been APPROVED. Remaining balance: {profile.leaves_balance} days."
            )

        return Response(LeaveRequestSerializer(leave).data)


# ===================== SALARY HISTORY =====================
class SalaryHistoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SalaryHistorySerializer
    queryset = SalaryHistory.objects.all()

    def get_queryset(self):
        user = self.request.user
        role = user.employee_profile.role
        if role in ['hr', 'ceo']:
            return SalaryHistory.objects.all()
        return SalaryHistory.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        # Update EmployeeProfile current_salary when new history is added
        response = super().create(request, *args, **kwargs)
        user_id = request.data.get('user')
        amount = request.data.get('amount')
        
        target_user = User.objects.get(id=user_id)
        profile = target_user.employee_profile
        profile.current_salary = amount
        profile.save()

        # Create Milestone and Notification
        CompanyMilestone.objects.create(
            user=target_user,
            type='Salary Hike',
            title='Salary Increased',
            description=f'Annual salary adjusted to ${amount}'
        )
        Notification.objects.create(
            user=target_user,
            message=f'Congratulations! Your salary has been updated to ${amount}.'
        )
        
        return response


# ===================== APPRECIATION =====================
class AppreciationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AppreciationSerializer
    queryset = Appreciation.objects.all()

    def get_queryset(self):
        user = self.request.user
        role = user.employee_profile.role
        if role in ['hr', 'ceo']:
            return Appreciation.objects.all()
        return Appreciation.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user_id = request.data.get('user')
        title = request.data.get('title')
        desc = request.data.get('description', '')

        target_user = User.objects.get(id=user_id)
        
        # Create Milestone and Notification
        CompanyMilestone.objects.create(
            user=target_user,
            type='Appreciation',
            title=title,
            description=desc
        )
        Notification.objects.create(
            user=target_user,
            message=f'New Appreciation: {title}!'
        )
        
        return response