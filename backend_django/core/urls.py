from django.urls import path
from . import views

urlpatterns = [
    path('auth/login', views.login),
    path('auth/me', views.auth_me),
    path('auth/logout', views.auth_logout),
    path('employees', views.employee_list_create),
    path('employees/<uuid:pk>', views.employee_detail_update_delete),
    path('attendance', views.attendance_mark),
    path('attendance/<uuid:employee_id>', views.attendance_list),
]
