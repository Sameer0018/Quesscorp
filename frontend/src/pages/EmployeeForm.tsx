import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { employeesApi } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    setFetchLoading(true);
    employeesApi
      .get(id)
      .then((res) => {
        setFullName(res.data.full_name);
        setEmail(res.data.email);
        setDepartment(res.data.department);
      })
      .catch((err) => addToast(getErrorMessage(err), 'error'))
      .finally(() => setFetchLoading(false));
  }, [id, addToast]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!full_name.trim()) e.full_name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!emailRegex.test(email)) e.email = 'Invalid email format';
    if (!department.trim()) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await employeesApi.update(id!, { full_name: full_name.trim(), email: email.trim(), department: department.trim() });
        addToast('Employee updated', 'success');
      } else {
        await employeesApi.create({ full_name: full_name.trim(), email: email.trim(), department: department.trim() });
        addToast('Employee created', 'success');
      }
      navigate('/employees');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  return (
    <Card title={isEdit ? 'Edit employee' : 'Add employee'}>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Input
          label="Full name"
          name="full_name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.full_name}
          placeholder="Jane Doe"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="jane@example.com"
          disabled={isEdit}
        />
        {isEdit && <p className="text-xs text-slate-500">Email cannot be changed.</p>}
        <Input
          label="Department"
          name="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          error={errors.department}
          placeholder="Engineering"
        />
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Link to="/employees">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
