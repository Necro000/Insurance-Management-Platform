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

// ─── Status Badge Colors (Tailwind classes for Dark Mode) ────────────────────
export const STATUS_COLORS = {
  // Policy
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10',
  expired: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  cancelled: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  // Claims
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10',
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10',
  rejected: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  // Payments
  paid: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10',
  overdue: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse',
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// ─── File Upload ──────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
