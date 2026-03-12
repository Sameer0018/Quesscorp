from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, Attendance

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email')


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ('id', 'full_name', 'email', 'department')

    def validate_full_name(self, value):
        if not (value and value.strip()):
            raise serializers.ValidationError('Full name is required')
        return value.strip()

    def validate_department(self, value):
        if not (value and value.strip()):
            raise serializers.ValidationError('Department is required')
        return value.strip()


class AttendanceSerializer(serializers.ModelSerializer):
    employee_id = serializers.UUIDField(write_only=True, required=True)
    date = serializers.DateField(required=True)
    status = serializers.ChoiceField(choices=Attendance.Status.choices, required=True)

    class Meta:
        model = Attendance
        fields = ('id', 'employee_id', 'date', 'status', 'employee')
        read_only_fields = ('id', 'employee')

    def validate_employee_id(self, value):
        if not Employee.objects.filter(pk=str(value)).exists():
            raise serializers.ValidationError('Employee not found')
        return value

    def create(self, validated_data):
        from .models import Employee
        eid = validated_data.pop('employee_id')
        employee = Employee.objects.get(pk=str(eid))
        obj, created = Attendance.objects.update_or_create(
            employee=employee,
            date=validated_data['date'],
            defaults={'status': validated_data['status']},
        )
        return obj

    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'employee_id': str(instance.employee_id),
            'date': instance.date.isoformat(),
            'status': instance.status,
        }
