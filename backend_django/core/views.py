from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Employee, Attendance
from .serializers import (
    UserSerializer,
    LoginSerializer,
    EmployeeSerializer,
    AttendanceSerializer,
)

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    from django.db import connection
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    return Response({
        'status': 'ok',
        'database': 'connected' if db_ok else 'disconnected',
    })


def _error_response(message, details=None, status_code=400):
    return Response(
        {'error': message, 'details': details or []},
        status=status_code,
    )


def _flatten_errors(errors):
    out = []
    for v in errors.values():
        if isinstance(v, list):
            out.extend(v)
        else:
            out.append(str(v))
    return out


# ----- Auth -----

@extend_schema(request=LoginSerializer, responses={200: None})
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': _flatten_errors(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {'error': 'Invalid email or password', 'details': []},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'user': {'id': str(user.id), 'email': user.email},
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_me(request):
    return Response({'id': str(request.user.id), 'email': request.user.email})


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_logout(request):
    return Response({'message': 'Logged out. Client should discard token.'})


# ----- Employees -----

@extend_schema(responses={200: EmployeeSerializer(many=True)}, methods=['GET'])
@extend_schema(request=EmployeeSerializer, responses={201: EmployeeSerializer}, methods=['POST'])
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def employee_list_create(request):
    if request.method == 'GET':
        qs = Employee.objects.all()
        serializer = EmployeeSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = EmployeeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': _flatten_errors(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if Employee.objects.filter(email=serializer.validated_data['email']).exists():
        return Response(
            {'error': 'Email already exists', 'details': ['An employee with this email already exists']},
            status=status.HTTP_409_CONFLICT,
        )
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(responses={200: EmployeeSerializer}, methods=['GET'])
@extend_schema(request=EmployeeSerializer, responses={200: EmployeeSerializer}, methods=['PUT'])
@extend_schema(responses={204: None}, methods=['DELETE'])
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def employee_detail_update_delete(request, pk):
    try:
        obj = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found', 'details': []}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = EmployeeSerializer(obj)
        return Response(serializer.data)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT
    serializer = EmployeeSerializer(instance=obj, data=request.data, partial=False)
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': _flatten_errors(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    other = Employee.objects.filter(email=serializer.validated_data['email']).exclude(pk=pk)
    if other.exists():
        return Response({'error': 'Email already exists', 'details': []}, status=status.HTTP_409_CONFLICT)
    serializer.save()
    return Response(serializer.data)


# ----- Attendance -----

@extend_schema(request=AttendanceSerializer, responses={201: AttendanceSerializer})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attendance_mark(request):
    serializer = AttendanceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'error': 'Validation failed', 'details': _flatten_errors(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    eid = serializer.validated_data['employee_id']
    d = serializer.validated_data['date']
    existed = Attendance.objects.filter(employee_id=str(eid), date=d).exists()
    obj = serializer.save()
    return Response(
        AttendanceSerializer(obj).data,
        status=status.HTTP_201_CREATED if not existed else status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_list(request, employee_id):
    if not Employee.objects.filter(pk=employee_id).exists():
        return Response({'error': 'Employee not found', 'details': []}, status=status.HTTP_404_NOT_FOUND)
    qs = Attendance.objects.filter(employee_id=employee_id).order_by('-date')
    serializer = AttendanceSerializer(qs, many=True)
    return Response(serializer.data)
