import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/common/Layout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CustomerListPage from '../pages/customers/CustomerListPage';
import CustomerDetailPage from '../pages/customers/CustomerDetailPage';
import CustomerFormPage from '../pages/customers/CustomerFormPage';
import PolicyListPage from '../pages/policies/PolicyListPage';
import PolicyDetailPage from '../pages/policies/PolicyDetailPage';
import PolicyFormPage from '../pages/policies/PolicyFormPage';
import PaymentListPage from '../pages/payments/PaymentListPage';
import PaymentFormPage from '../pages/payments/PaymentFormPage';
import ClaimListPage from '../pages/claims/ClaimListPage';
import ClaimDetailPage from '../pages/claims/ClaimDetailPage';
import ClaimFormPage from '../pages/claims/ClaimFormPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import ReportsPage from '../pages/reports/ReportsPage';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
    <div className="card max-w-md w-full p-8 text-center space-y-4 glass">
      <div className="text-5xl">🚫</div>
      <h1 className="text-2xl font-bold text-red-400">403 Forbidden</h1>
      <p className="text-sm text-[var(--color-muted)]">
        You do not have permission to access this resource.
      </p>
      <a href="/dashboard" className="btn-primary inline-block text-xs">
        Return to Dashboard
      </a>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes wrapped with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Customer Routes (Admin / Agent only) */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute roles={['admin', 'agent']}>
            <Layout>
              <CustomerListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/new"
        element={
          <ProtectedRoute roles={['admin', 'agent']}>
            <Layout>
              <CustomerFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute roles={['admin', 'agent']}>
            <Layout>
              <CustomerDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id/edit"
        element={
          <ProtectedRoute roles={['admin', 'agent']}>
            <Layout>
              <CustomerFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Policy Routes */}
      <Route
        path="/policies"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <PolicyListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies/new"
        element={
          <ProtectedRoute roles={['admin', 'agent']}>
            <Layout>
              <PolicyFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies/:id"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <PolicyDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies/:id/edit"
        element={
          <ProtectedRoute roles={['admin', 'agent']}>
            <Layout>
              <PolicyFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Payment Routes */}
      <Route
        path="/payments"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <PaymentListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/new"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <PaymentFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Claim Routes */}
      <Route
        path="/claims"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <ClaimListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/claims/new"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <ClaimFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/claims/:id"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <ClaimDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Document Routes */}
      <Route
        path="/documents"
        element={
          <ProtectedRoute roles={['admin', 'agent', 'customer']}>
            <Layout>
              <DocumentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Report Routes (Admin only) */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
