import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerListPage from './pages/customers/CustomerListPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import CustomerFormPage from './pages/customers/CustomerFormPage';
import PolicyListPage from './pages/policies/PolicyListPage';
import PolicyDetailPage from './pages/policies/PolicyDetailPage';
import PolicyFormPage from './pages/policies/PolicyFormPage';
import useAuth from './hooks/useAuth';
import './index.css';

// Navigation Layout Wrapper
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'agent', 'customer'] },
    { name: 'Customers', path: '/customers', roles: ['admin', 'agent'] },
    { name: 'Policies', path: '/policies', roles: ['admin', 'agent', 'customer'] },
  ];

  const allowedLinks = navLinks.filter((link) => link.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* Header Navbar */}
      <header className="border-b border-[var(--color-border)] glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-gradient">
              <span>🛡️</span> Insurance Platform
            </Link>

            <nav className="hidden md:flex gap-4">
              {allowedLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-[var(--color-muted)] hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[10px] uppercase font-bold text-indigo-400">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-white/5 transition-colors text-[var(--color-muted)] hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
};

// Placeholder Dashboard Page
const DashboardPlaceholder = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Welcome back, <span className="text-white font-semibold">{user?.name}</span>!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 space-y-2">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">User Profile</div>
          <div className="text-base font-bold text-white">{user?.name}</div>
          <div className="text-xs text-[var(--color-muted)]">{user?.email}</div>
        </div>

        <div className="card p-6 space-y-2">
          <div className="text-xs font-semibold text-[var(--color-muted)] uppercase">Role</div>
          <div className="text-base font-bold uppercase text-indigo-400">{user?.role}</div>
        </div>

        <Link to="/policies" className="card p-6 space-y-2 hover:border-indigo-500/50 transition-colors block">
          <div className="text-xs font-semibold text-indigo-400 uppercase">Quick Access →</div>
          <div className="text-base font-bold text-white">View Policies</div>
          <div className="text-xs text-[var(--color-muted)]">Browse active and expired policies</div>
        </Link>
      </div>
    </div>
  );
};

// Unauthorized Page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
    <div className="card max-w-md w-full p-8 text-center space-y-4 glass">
      <div className="text-5xl">🚫</div>
      <h1 className="text-2xl font-bold text-red-400">403 Forbidden</h1>
      <p className="text-sm text-[var(--color-muted)]">
        You do not have permission to access this resource.
      </p>
      <Link to="/dashboard" className="btn-primary inline-block text-xs">
        Return to Dashboard
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute roles={['admin', 'agent']}>
                <AppLayout>
                  <CustomerListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <ProtectedRoute roles={['admin', 'agent']}>
                <AppLayout>
                  <CustomerFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute roles={['admin', 'agent']}>
                <AppLayout>
                  <CustomerDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute roles={['admin', 'agent']}>
                <AppLayout>
                  <CustomerFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Policy Routes */}
          <Route
            path="/policies"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <PolicyListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/new"
            element={
              <ProtectedRoute roles={['admin', 'agent']}>
                <AppLayout>
                  <PolicyFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/:id"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <PolicyDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/:id/edit"
            element={
              <ProtectedRoute roles={['admin', 'agent']}>
                <AppLayout>
                  <PolicyFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
