from rest_framework import serializers
from django.contrib.auth.models import User
from .models import EmployeeProfile, Attendance, LeaveRequest, SalaryHistory, Appreciation, CompanyMilestone, Notification

class SalaryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryHistory
        fields = ['user', 'amount', 'date']

class AppreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appreciation
        fields = ['id', 'user', 'title', 'description', 'date']

class CompanyMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyMilestone
        fields = ['id', 'type', 'title', 'description', 'date']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = ['role', 'is_approved', 'base_salary', 'current_salary', 'department', 'leaves_balance', 'phone', 'address']

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    employee_profile = EmployeeProfileSerializer(required=False)
    salary_history = SalaryHistorySerializer(many=True, read_only=True)
    appreciations = AppreciationSerializer(many=True, read_only=True)
    attendance_records = AttendanceSerializer(many=True, read_only=True, source='attendance_set')
    leave_requests = LeaveRequestSerializer(many=True, read_only=True, source='leaverequest_set')
    milestones = CompanyMilestoneSerializer(many=True, read_only=True)
    notifications = NotificationSerializer(many=True, read_only=True, source='user_notifications')
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'employee_profile', 'salary_history', 'appreciations',
            'attendance_records', 'leave_requests', 'milestones', 'notifications'
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('employee_profile', None)
        instance = super().update(instance, validated_data)
        
        if profile_data:
            profile = instance.employee_profile
            changes = []
            if 'role' in profile_data and profile_data['role'] != profile.role:
                changes.append(f"Role updated to {profile_data['role']}")
            if 'department' in profile_data and profile_data['department'] != profile.department:
                changes.append(f"Department updated to {profile_data['department']}")
            
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
            if changes:
                msg = "Profile updated: " + ", ".join(changes)
                Notification.objects.create(user=instance, message=msg)
                CompanyMilestone.objects.create(
                    user=instance, 
                    type='Profile Update', 
                    title='Records Updated', 
                    description=msg
                )
            
        return instance
