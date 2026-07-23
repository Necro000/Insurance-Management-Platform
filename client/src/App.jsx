import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomerListPage from './pages/customers/CustomerListPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import CustomerFormPage from './pages/customers/CustomerFormPage';
import PolicyListPage from './pages/policies/PolicyListPage';
import PolicyDetailPage from './pages/policies/PolicyDetailPage';
import PolicyFormPage from './pages/policies/PolicyFormPage';
import PaymentListPage from './pages/payments/PaymentListPage';
import PaymentFormPage from './pages/payments/PaymentFormPage';
import ClaimListPage from './pages/claims/ClaimListPage';
import ClaimDetailPage from './pages/claims/ClaimDetailPage';
import ClaimFormPage from './pages/claims/ClaimFormPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import ReportsPage from './pages/reports/ReportsPage';
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
    { name: 'Claims', path: '/claims', roles: ['admin', 'agent', 'customer'] },
    { name: 'Payments', path: '/payments', roles: ['admin', 'agent', 'customer'] },
    { name: 'Documents', path: '/documents', roles: ['admin', 'agent', 'customer'] },
    { name: 'Reports', path: '/reports', roles: ['admin'] },
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
                  <DashboardPage />
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

          {/* Payment Routes */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <PaymentListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/new"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <PaymentFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Claim Routes */}
          <Route
            path="/claims"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <ClaimListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims/new"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <ClaimFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims/:id"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <ClaimDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Document Routes */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute roles={['admin', 'agent', 'customer']}>
                <AppLayout>
                  <DocumentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Report Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppLayout>
                  <ReportsPage />
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
