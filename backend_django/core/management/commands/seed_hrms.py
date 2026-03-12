from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Employee, Attendance
import uuid

User = get_user_model()

SAMPLE_EMPLOYEES = [
    {'full_name': 'Alice Johnson', 'email': 'alice@example.com', 'department': 'Engineering'},
    {'full_name': 'Bob Smith', 'email': 'bob@example.com', 'department': 'HR'},
    {'full_name': 'Carol White', 'email': 'carol@example.com', 'department': 'Engineering'},
    {'full_name': 'David Brown', 'email': 'david@example.com', 'department': 'Finance'},
    {'full_name': 'Eve Davis', 'email': 'eve@example.com', 'department': 'HR'},
]

DATES = ['2025-03-01', '2025-03-02', '2025-03-03', '2025-03-04', '2025-03-05', '2025-03-06', '2025-03-07']


class Command(BaseCommand):
    help = 'Seed default user (admin@hrms.local / admin123) and sample employees + attendance'

    def handle(self, *args, **options):
        email = 'admin@hrms.local'
        password = 'admin123'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'id': str(uuid.uuid4())},
        )
        user.set_password(password)
        user.save()
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created default user: {email} / {password}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Reset password for: {email} / {password}'))

        for emp_data in SAMPLE_EMPLOYEES:
            emp, created = Employee.objects.get_or_create(
                email=emp_data['email'],
                defaults={
                    'id': str(uuid.uuid4()),
                    'full_name': emp_data['full_name'],
                    'department': emp_data['department'],
                },
            )
            if created:
                self.stdout.write(f'Inserted employee: {emp_data["email"]}')
            for d in DATES:
                status = 'Present' if hash(f'{emp.id}{d}') % 5 != 0 else 'Absent'
                Attendance.objects.update_or_create(
                    employee=emp,
                    date=d,
                    defaults={'status': status},
                )
        self.stdout.write(self.style.SUCCESS('Seed completed.'))
