import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceApi, employeesApi, type AttendanceRecord, type Employee } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';

export default function AttendanceList() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    Promise.all([
      employeesApi.get(employeeId).then((r) => r.data).catch(() => null),
      attendanceApi.list(employeeId).then((r) => r.data).catch((err) => {
        setError(getErrorMessage(err));
        return [];
      }),
    ]).then(([emp, list]) => {
      setEmployee(emp ?? null);
      setRecords(list);
    }).finally(() => setLoading(false));
  }, [employeeId]);

  if (!employeeId) return null;

  const columns = [
    { key: 'date', header: 'Date', render: (r: AttendanceRecord) => new Date(r.date).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (r: AttendanceRecord) => <span className={r.status === 'Present' ? 'text-emerald-600' : 'text-red-600'}>{r.status}</span> },
  ];

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/employees">
          <Button variant="ghost">← Back to employees</Button>
        </Link>
      </div>
      <Card title={employee ? `Attendance: ${employee.full_name}` : 'Attendance'}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600" />
          </div>
        ) : (
          <Table<AttendanceRecord>
            columns={columns}
            data={records}
            keyExtractor={(r) => r.id}
            emptyMessage="No attendance records yet. Mark attendance from the Mark Attendance page."
          />
        )}
        <div className="mt-4">
          <Link to="/attendance">
            <Button variant="secondary">Mark attendance</Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
