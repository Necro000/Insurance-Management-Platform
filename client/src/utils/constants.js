/**
 * App-wide constants.
 * Centralizes magic strings, route paths, and configuration values.
 */

// ─── User Roles ──────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CUSTOMER: 'customer',
};

// ─── Policy Status ────────────────────────────────────────────────────────────
export const POLICY_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// ─── Claim Status ─────────────────────────────────────────────────────────────
export const CLAIM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ─── Payment Status ───────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
};

// ─── Route Paths ──────────────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: (id) => `/customers/${id}`,
  POLICIES: '/policies',
  POLICY_NEW: '/policies/new',
  POLICY_DETAIL: (id) => `/policies/${id}`,
  CLAIMS: '/claims',
  CLAIM_NEW: '/claims/new',
  CLAIM_DETAIL: (id) => `/claims/${id}`,
  PAYMENTS: '/payments',
  DOCUMENTS: '/documents',
  REPORTS: '/reports',
  UNAUTHORIZED: '/unauthorized',
};

// ─── Status Badge Colors (Tailwind classes) ───────────────────────────────────
export const STATUS_COLORS = {
  // Policy
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  // Claims
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  // Payments
  paid: 'bg-blue-100 text-blue-800',
  overdue: 'bg-orange-100 text-orange-800',
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ─── File Upload ──────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
