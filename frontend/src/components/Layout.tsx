import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/employees" className="text-lg font-semibold">
            HRMS Lite
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/employees"
              className={`px-3 py-1 rounded ${location.pathname.startsWith('/employees') && !location.pathname.includes('attendance') ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
            >
              Employees
            </Link>
            <Link
              to="/attendance"
              className={`px-3 py-1 rounded ${location.pathname === '/attendance' ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
            >
              Mark Attendance
            </Link>
            <span className="text-slate-300 text-sm">{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-500 text-sm"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
