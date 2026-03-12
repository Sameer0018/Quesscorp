import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeesApi, type Employee } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { addToast } = useToast();

  const fetchEmployees = () => {
    setLoading(true);
    setError('');
    employeesApi
      .list()
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchEmployees(), []);

  const handleDelete = (id: string) => {
    setDeleting(true);
    employeesApi
      .delete(id)
      .then(() => {
        addToast('Employee deleted', 'success');
        setDeleteId(null);
        fetchEmployees();
      })
      .catch((err) => addToast(getErrorMessage(err), 'error'))
      .finally(() => setDeleting(false));
  };

  const columns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Employee) => (
        <div className="flex gap-2">
          <Link
            to={`/employees/${row.id}/edit`}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            Edit
          </Link>
          <Link
            to={`/attendance/${row.id}`}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            Attendance
          </Link>
          <button
            type="button"
            onClick={() => setDeleteId(row.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
        <Link to="/employees/new">
          <Button>Add Employee</Button>
        </Link>
      </div>
      <Card title="All employees">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
            <button type="button" onClick={fetchEmployees} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}
        <Table<Employee>
          columns={columns}
          data={employees}
          keyExtractor={(r) => r.id}
          emptyMessage="No employees yet. Add one to get started."
          loading={loading}
        />
      </Card>
      <Modal
        open={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        title="Delete employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete this employee? This will also delete their attendance records.
      </Modal>
    </>
  );
}
