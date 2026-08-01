import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_tennis_club.settings')
django.setup()

from django.contrib.auth.models import User
from employee.models import EmployeeProfile

def fix_users():
    users = User.objects.all()
    for user in users:
        profile, created = EmployeeProfile.objects.get_or_create(user=user)
        if created:
            # Default logic
            if user.username.lower() == 'amrutha':
                profile.role = 'hr'
            elif user.username.lower() == 'satya':
                profile.role = 'ceo'
            else:
                profile.role = 'employee'
            profile.is_approved = True
            profile.save()
            print(f"Created profile for {user.username} as {profile.role}")
        else:
            print(f"Profile already exists for {user.username}")

if __name__ == '__main__':
    fix_users()
