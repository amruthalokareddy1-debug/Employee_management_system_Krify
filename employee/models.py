from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime

# ================= ROLE CHOICES =================
ROLE_CHOICES = (
    ('employee', 'Employee'),
    ('hr', 'HR'),
    ('ceo', 'CEO'),
)

# ================= LEAVE STATUS =================
LEAVE_STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
)

# ================= LEAVE TYPE =================
LEAVE_TYPE_CHOICES = (
    ('sick', 'Sick Leave'),
    ('vacation', 'Vacation'),
    ('personal', 'Personal Leave'),
    ('emergency', 'Emergency'),
)

# ================= EMPLOYEE PROFILE =================
class EmployeeProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='employee_profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    is_approved = models.BooleanField(default=False)
    login_version = models.IntegerField(default=0)

    # Salary details
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    current_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    # Extra useful fields (for real system)
    department = models.CharField(max_length=50, blank=True, null=True)
    leaves_balance = models.IntegerField(default=24)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ================= OTP =================
class OTPRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.created_at + datetime.timedelta(minutes=5)

class SignupOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)


# ================= ATTENDANCE =================
class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)

    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)

    meetings_attended = models.IntegerField(default=0)

    # Extra field for real system
    status = models.CharField(max_length=10, default='present')

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date}"


# ================= LEAVE =================
class LeaveRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    start_date = models.DateField()
    end_date = models.DateField()

    reason = models.TextField()
    leave_type = models.CharField(
        max_length=20,
        choices=LEAVE_TYPE_CHOICES,
        default='personal'
    )

    status = models.CharField(
        max_length=20,
        choices=LEAVE_STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"


# ================= COMPANY MILESTONES (The History Group) =================
class CompanyMilestone(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='milestones')
    type = models.CharField(max_length=50) # 'Salary Hike', 'Appreciation'
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type}: {self.title}"


# ================= NOTIFICATIONS =================
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}..."


# ================= SALARY HISTORY =================
class SalaryHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='salary_history')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} on {self.date}"


# ================= APPRECIATION =================
class Appreciation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appreciations')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"