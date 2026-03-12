import { api } from './client';

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; email: string } }>('/auth/login', { email, password }),
  me: () => api.get<{ id: string; email: string }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const employeesApi = {
  list: () => api.get<Employee[]>('/employees'),
  get: (id: string) => api.get<Employee>(`/employees/${id}`),
  create: (data: { full_name: string; email: string; department: string }) =>
    api.post<Employee>('/employees', data),
  update: (id: string, data: { full_name: string; email: string; department: string }) =>
    api.put<Employee>(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export const attendanceApi = {
  list: (employeeId: string) => api.get<AttendanceRecord[]>(`/attendance/${employeeId}`),
  mark: (data: { employee_id: string; date: string; status: 'Present' | 'Absent' }) =>
    api.post<AttendanceRecord>('/attendance', data),
};
