import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import useAuth from './hooks/useAuth';
import './index.css';

// Placeholder Dashboard Page until Phase 10
const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="card max-w-lg w-full p-8 text-center space-y-6 glass">
        <div className="text-5xl">📊</div>
        <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Welcome back, <span className="text-white font-semibold">{user?.name}</span>!
        </p>
        <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-left text-xs space-y-1">
          <div><span className="text-[var(--color-muted)]">Email:</span> {user?.email}</div>
          <div><span className="text-[var(--color-muted)]">Role:</span> <span className="uppercase font-semibold text-indigo-400">{user?.role}</span></div>
          <div><span className="text-[var(--color-muted)]">User ID:</span> {user?.id}</div>
        </div>
        <button onClick={logout} className="btn-primary w-full">
          Sign Out
        </button>
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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
