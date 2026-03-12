import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceApi, employeesApi, type Employee } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function MarkAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    employeesApi
      .list()
      .then((res) => setEmployees(res.data))
      .catch((err) => addToast(getErrorMessage(err), 'error'))
      .finally(() => setFetchLoading(false));
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      addToast('Please select an employee', 'error');
      return;
    }
    setLoading(true);
    try {
      await attendanceApi.mark({ employee_id: employeeId, date, status });
      addToast('Attendance marked', 'success');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link to="/employees">
          <Button variant="ghost">← Back to employees</Button>
        </Link>
      </div>
      <Card title="Mark attendance">
        {fetchLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-slate-500">No employees. Add employees first.</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="employee" className="text-sm font-medium text-slate-700">
                Employee
              </label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="status" className="text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Present' | 'Absent')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <Button type="submit" loading={loading}>
              Mark attendance
            </Button>
          </form>
        )}
      </Card>
    </>
  );
}
