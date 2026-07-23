# Phase-Wise Implementation Plan
## Insurance Management Platform

> Derived from [`architecture.md`](./architecture.md) · Full-Stack · React + Node.js + PostgreSQL + Prisma

---

## Overview

| Phase | Name | Duration | Focus Area |
|---|---|---|---|
| **Phase 0** | Project Setup & Foundation | Day 1 | Monorepo, tooling, Git, env config |
| **Phase 1** | Database & Backend Foundation | Day 2 | PostgreSQL, Prisma schema, Express server, auth |
| **Phase 2** | Authentication Module | Day 2–3 | Register, login, JWT, middleware, RBAC |
| **Phase 3** | Customer Management | Day 3 | Customer CRUD, search, pagination |
| **Phase 4** | Policy Management | Day 4 | Policy CRUD, renew, cancel, expiry |
| **Phase 5** | Premium Tracking | Day 5 | Payment recording, status, alerts |
| **Phase 6** | Claim Management | Day 6 | Claim submission, verification, approval |
| **Phase 7** | Document Upload | Day 7 | Multer, file storage, download |
| **Phase 8** | Reports & Dashboard | Day 8 | Aggregations, Chart.js, PDF export |
| **Phase 9** | Search, Filters & Pagination | Day 9 | Query params, reusable hooks |
| **Phase 10** | Frontend UI & Role Guards | Day 10–11 | Pages, components, protected routes |
| **Phase 11** | Validation & Error Handling | Day 11 | Zod, global error middleware, toast UI |
| **Phase 12** | Testing & Bug Fixes | Day 12 | Postman, manual testing, fixes |
| **Phase 13** | UI Polish & Responsive Design | Day 13 | Tailwind responsive, accessibility |
| **Phase 14** | Deployment & Documentation | Day 14 | Vercel, Render/Railway, env vars |

---

## Phase 0 — Project Setup & Foundation

> **Goal:** Create the monorepo, initialize both `client/` and `server/` directories, configure tooling and Git.

### 0.1 Repository & Folder Structure

```bash
# Root structure
mkdir insurance-management-platform
cd insurance-management-platform
git init
mkdir client server DOCS
```

Create `.gitignore`:
```
node_modules/
.env
uploads/
dist/
```

### 0.2 Backend Initialization

```bash
cd server
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv multer zod pdfkit
npm install -D nodemon
npx prisma init
```

Create `server.js` entry point and `src/app.js` with Express boilerplate + CORS.

### 0.3 Frontend Initialization

```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom chart.js react-chartjs-2
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js` and `index.css` with base styles.

### 0.4 Environment Files

**`server/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/insurance_db
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 0.5 Deliverables Checklist
- [ ] Monorepo folder structure matches `architecture.md §2`
- [ ] Both `client/` and `server/` npm projects initialized
- [ ] Git repository with `.gitignore` configured
- [ ] `.env` files in place (not committed)
- [ ] Tailwind CSS working in client

---

## Phase 1 — Database & Backend Foundation

> **Goal:** Define the full Prisma schema, run migrations, set up the Express server skeleton.

### 1.1 Prisma Schema

Create `server/prisma/schema.prisma` with all 6 models and enums as defined in `architecture.md §5`:

```
Models:   User · Customer · Policy · Claim · PremiumPayment · Document
Enums:    Role · PolicyStatus · ClaimStatus · PaymentStatus
```

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma studio          # Optional: verify schema visually
```

### 1.2 Prisma Client Config

```js
// src/config/db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

### 1.3 Express App Skeleton

Create `src/app.js` with:
- `express.json()` body parser
- CORS configured for `CLIENT_URL`
- Route mounting stubs for all 7 resource routers
- Global error middleware at the bottom

Create `src/utils/responseHelper.js`:
```js
const success = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

const error = (res, message, status = 500) =>
  res.status(status).json({ success: false, message });
```

### 1.4 File & Folder Scaffold

Create all empty files per the folder structure:

```
server/src/
├── controllers/   authController.js · customerController.js · ...
├── routes/        authRoutes.js · customerRoutes.js · ...
├── services/      authService.js · customerService.js · ...
├── middleware/    authMiddleware.js · roleMiddleware.js · uploadMiddleware.js · errorMiddleware.js
├── validators/    authValidator.js · customerValidator.js · ...
└── utils/         jwtUtils.js · pdfGenerator.js · responseHelper.js
```

### 1.5 Deliverables Checklist
- [ ] `schema.prisma` has all 6 models + 4 enums
- [ ] Migration run successfully — tables exist in PostgreSQL
- [ ] Express server starts on PORT 5000 without errors
- [ ] All route files mounted and returning `404` stubs
- [ ] `responseHelper.js` utility working

---

## Phase 2 — Authentication Module

> **Goal:** Implement full register/login with JWT, auth middleware, and role middleware.

### 2.1 Zod Validators

`src/validators/authValidator.js`:
```js
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'agent', 'customer']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### 2.2 Auth Service

`src/services/authService.js`:
- `registerUser(data)` → hash password with bcrypt (10 rounds) → `prisma.user.create()`
- `loginUser(email, password)` → find user → `bcrypt.compare()` → sign JWT → return `{ token, user (without password) }`
- `getCurrentUser(userId)` → `prisma.user.findUnique()` → omit password

### 2.3 JWT Utilities

`src/utils/jwtUtils.js`:
```js
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
```

### 2.4 Auth Middleware

`src/middleware/authMiddleware.js`:
- Extract `Authorization: Bearer <token>` header
- Call `verifyToken()` → attach `req.user = { userId, role, email }`
- On failure → `401 Unauthorized`

`src/middleware/roleMiddleware.js`:
```js
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json(...);
  next();
};
```

### 2.5 Auth Controller & Routes

`POST /api/auth/register` → validate → `authService.registerUser()` → 201  
`POST /api/auth/login` → validate → `authService.loginUser()` → 200 with token  
`GET /api/auth/me` → `authMiddleware` → `authService.getCurrentUser()` → 200

### 2.6 Frontend Auth Module

Files to create:
- `src/context/AuthContext.jsx` — state: `{ user, token, role, isAuthenticated }`, actions: `login()`, `logout()`
- `src/hooks/useAuth.js` — returns `useContext(AuthContext)`
- `src/utils/axiosInstance.js` — Axios with base URL + JWT interceptor (see `architecture.md §3`)
- `src/pages/auth/LoginPage.jsx` — form, calls `POST /api/auth/login`, stores token
- `src/pages/auth/RegisterPage.jsx` — form, calls `POST /api/auth/register`
- `src/routes/ProtectedRoute.jsx` — redirects to `/login` if not authenticated; checks role

### 2.7 Deliverables Checklist
- [ ] `POST /api/auth/register` returns 201 with user object
- [ ] `POST /api/auth/login` returns JWT token
- [ ] `GET /api/auth/me` returns current user (requires valid JWT)
- [ ] `authMiddleware` blocks requests without token (401)
- [ ] `roleMiddleware` blocks wrong-role requests (403)
- [ ] Login page stores token and redirects to `/dashboard`
- [ ] `ProtectedRoute` redirects unauthenticated users to `/login`

---

## Phase 3 — Customer Management Module

> **Goal:** Full CRUD for customers, with search and pagination.

### 3.1 Backend

**Service** (`customerService.js`):
- `getAllCustomers({ search, page, limit })` → `prisma.customer.findMany()` with `where: { name: { contains: search } }`, `skip`, `take`
- `getCustomerById(id)` → with policies and claims history
- `createCustomer(data)` → `prisma.customer.create()`
- `updateCustomer(id, data)` → `prisma.customer.update()`
- `getCustomerHistory(id)` → `prisma.policy.findMany({ where: { customerId: id }, include: { claims: true } })`

**Validator** (`customerValidator.js`):
```js
const customerSchema = z.object({
  name: z.string().min(2),
  dob: z.string(),              // ISO date string
  phone: z.string().min(10),
  address: z.string(),
  email: z.string().email(),
});
```

**Routes** (`customerRoutes.js`):
```
GET    /api/customers              → [auth] [admin|agent] getAllCustomers
POST   /api/customers              → [auth] [admin|agent] createCustomer
GET    /api/customers/:id          → [auth] [admin|agent] getCustomerById
PUT    /api/customers/:id          → [auth] [admin|agent] updateCustomer
GET    /api/customers/:id/history  → [auth] [admin|agent] getCustomerHistory
```

### 3.2 Frontend

Files to create:
- `src/api/customerApi.js` — axios functions for each endpoint
- `src/pages/customers/CustomerListPage.jsx` — table with search + pagination
- `src/pages/customers/CustomerDetailPage.jsx` — profile + history tabs
- `src/pages/customers/CustomerFormPage.jsx` — add/edit form (reuses `CustomerForm.jsx`)
- `src/components/forms/CustomerForm.jsx` — controlled form component

### 3.3 Deliverables Checklist
- [ ] `GET /api/customers?search=john&page=1&limit=10` works with correct pagination
- [ ] `POST /api/customers` creates and returns new customer
- [ ] Customer list renders in UI with search and pagination
- [ ] Customer detail page shows profile + policy history
- [ ] Create/edit form validates before submitting

---

## Phase 4 — Policy Management Module

> **Goal:** Full policy lifecycle — create, view, renew, cancel, with status tracking.

### 4.1 Backend

**Service** (`policyService.js`):
- `getAllPolicies({ status, page, limit })` → filter by status if provided
- `getPolicyById(id)` → include customer, claims, payments
- `createPolicy(data)` → auto-generate `policyNumber` (e.g., `POL-<timestamp>`)
- `updatePolicy(id, data)`
- `renewPolicy(id)` → extend `endDate` by 1 year, set `status: 'active'`
- `cancelPolicy(id)` → set `status: 'cancelled'`

**Routes** (`policyRoutes.js`):
```
GET    /api/policies               → [auth] [admin|agent]
POST   /api/policies               → [auth] [admin|agent]
GET    /api/policies/:id           → [auth] (customer sees own only)
PUT    /api/policies/:id           → [auth] [admin|agent]
PATCH  /api/policies/:id/renew     → [auth] [admin|agent]
PATCH  /api/policies/:id/cancel    → [auth] [admin]
```

### 4.2 Frontend

Files to create:
- `src/api/policyApi.js`
- `src/pages/policies/PolicyListPage.jsx` — filterable by status (active/expired/cancelled)
- `src/pages/policies/PolicyDetailPage.jsx` — details + linked claims + payments
- `src/pages/policies/PolicyFormPage.jsx` — create/edit form with customer selector
- `src/components/forms/PolicyForm.jsx`
- `src/components/common/StatusBadge.jsx` — colored badge for active/expired/cancelled

### 4.3 Deliverables Checklist
- [ ] Policies can be created, viewed, updated
- [ ] `PATCH /api/policies/:id/renew` updates `endDate` correctly
- [ ] `PATCH /api/policies/:id/cancel` sets status to `cancelled`
- [ ] Customer-role users can only see their own policies
- [ ] `StatusBadge` renders correct color for each status

---

## Phase 5 — Premium Tracking Module

> **Goal:** Record payments, track status (paid/pending/overdue), show payment history.

### 5.1 Backend

**Service** (`paymentService.js`):
- `getPaymentsByPolicy(policyId)` → all payments for a policy
- `getAllPayments({ page, limit })` → admin/agent overview
- `recordPayment(data)` → `prisma.premiumPayment.create()`
- `markOverdue()` → batch update: set `paymentStatus: 'overdue'` where `paymentDate < today AND paymentStatus = 'pending'`

**Routes** (`paymentRoutes.js`):
```
GET  /api/payments                     → [auth] [admin|agent]
POST /api/payments                     → [auth]
GET  /api/payments/policy/:policyId    → [auth]
```

### 5.2 Frontend

Files to create:
- `src/api/paymentApi.js`
- `src/pages/payments/PaymentListPage.jsx` — list with status badges and due dates
- `src/pages/payments/PaymentFormPage.jsx` — record a new payment
- `src/components/forms/PaymentForm.jsx`

### 5.3 Deliverables Checklist
- [ ] `POST /api/payments` records a payment linked to a policy
- [ ] Payment list shows status (paid/pending/overdue) with badge
- [ ] `GET /api/payments/policy/:policyId` returns correct policy payments
- [ ] Overdue payments visually highlighted in UI

---

## Phase 6 — Claim Management Module

> **Goal:** Customers submit claims; agents review, verify, approve or reject.

### 6.1 Backend

**Service** (`claimService.js`):
- `getAllClaims({ status, page, limit })` → admin/agent view
- `getClaimsByCustomer(customerId)` → customer's own claims via policy relation
- `getClaimById(id)` → include policy, customer, documents
- `submitClaim(data)` → `prisma.claim.create()` with `status: 'pending'`
- `updateClaimStatus(id, status)` → `prisma.claim.update()` to `approved` or `rejected`

**Routes** (`claimRoutes.js`):
```
GET    /api/claims              → [auth] [admin|agent]
POST   /api/claims              → [auth] [customer]
GET    /api/claims/:id          → [auth]
PATCH  /api/claims/:id/status   → [auth] [admin|agent]
```

### 6.2 Frontend

Files to create:
- `src/api/claimApi.js`
- `src/pages/claims/ClaimListPage.jsx` — filterable by status (pending/approved/rejected)
- `src/pages/claims/ClaimDetailPage.jsx` — claim info + approve/reject buttons (agent/admin only)
- `src/pages/claims/ClaimFormPage.jsx` — claim submission form (customer only)
- `src/components/forms/ClaimForm.jsx`

### 6.3 Deliverables Checklist
- [ ] Customer can submit a claim (`POST /api/claims`) linked to their policy
- [ ] Agent sees pending claims and can approve/reject
- [ ] `PATCH /api/claims/:id/status` correctly updates status
- [ ] Claim detail page shows different actions per role (approve/reject vs read-only)
- [ ] Customers cannot approve/reject (403 returned)

---

## Phase 7 — Document Upload Module

> **Goal:** Allow file uploads (JPEG, PNG, PDF ≤ 5MB), store metadata in DB, enable download.

### 7.1 Backend

**Multer Middleware** (`uploadMiddleware.js`):
- Disk storage to `server/uploads/`
- Unique filename: `${Date.now()}-${random}-${originalname}`
- Filter: only `image/jpeg`, `image/png`, `application/pdf`
- Limit: 5MB per file

**Service** (`documentService.js`):
- `uploadDocument({ customerId, file })` → `prisma.document.create({ fileName, filePath, customerId })`
- `getDocumentsByCustomer(customerId)` → list all docs
- `downloadDocument(id)` → fetch `filePath` → `res.download(path)`

**Routes** (`documentRoutes.js`):
```
POST /api/documents/upload                   → [auth] + upload middleware
GET  /api/documents/customer/:customerId     → [auth]
GET  /api/documents/:id/download             → [auth]
```

### 7.2 Frontend

Files to create:
- `src/api/documentApi.js`
- `src/pages/documents/DocumentsPage.jsx` — upload form + document list + download button
- File upload uses `FormData` (not JSON)

```js
// documentApi.js
const uploadDocument = (customerId, file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('customerId', customerId);
  return axiosInstance.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### 7.3 Deliverables Checklist
- [ ] File saved to `uploads/` with unique name
- [ ] `POST /api/documents/upload` returns document metadata
- [ ] `GET /api/documents/:id/download` streams file correctly
- [ ] Invalid file type returns `400 Bad Request`
- [ ] Files over 5MB are rejected
- [ ] Documents page renders upload form and file list

---

## Phase 8 — Reports & Dashboard Module

> **Goal:** Admin dashboard with stats cards, Chart.js charts, and PDF export.

### 8.1 Backend

**Service** (`reportService.js`):

`getDashboardStats()` runs these Prisma aggregation queries in parallel:
```js
const [
  activePolicies,
  expiredPolicies,
  pendingClaims,
  monthlyRevenue,
  customerGrowth,
] = await Promise.all([
  prisma.policy.count({ where: { status: 'active' } }),
  prisma.policy.count({ where: { status: 'expired' } }),
  prisma.claim.count({ where: { status: 'pending' } }),
  prisma.premiumPayment.aggregate({
    where: { paymentStatus: 'paid', paymentDate: { gte: startOfMonth } },
    _sum: { amount: true },
  }),
  prisma.customer.groupBy({
    by: ['createdAt'],           // grouped by month
    _count: { id: true },
    orderBy: { createdAt: 'asc' },
    take: 6,
  }),
]);
```

`exportPDF()` — uses PDFKit to write summary stats + tables to a PDF buffer → pipe to response.

**Routes** (`reportRoutes.js`):
```
GET /api/reports/dashboard       → [auth] [admin]
GET /api/reports/policies        → [auth] [admin]
GET /api/reports/claims          → [auth] [admin]
GET /api/reports/premiums        → [auth] [admin]
GET /api/reports/export/pdf      → [auth] [admin]
```

### 8.2 Frontend

Files to create:
- `src/api/reportApi.js`
- `src/pages/reports/ReportsPage.jsx` — admin-only, shows charts + export button
- `src/pages/dashboard/DashboardPage.jsx` — stat cards + 3 charts

Chart components:
- `src/components/charts/BarChart.jsx` — monthly premium collection
- `src/components/charts/LineChart.jsx` — customer growth over 6 months
- `src/components/charts/PieChart.jsx` — claims by status

### 8.3 Deliverables Checklist
- [ ] `GET /api/reports/dashboard` returns all aggregated stats
- [ ] Dashboard shows 4 stat cards (customers, active policies, pending claims, monthly revenue)
- [ ] Bar chart, Line chart, Pie chart render correctly with real data
- [ ] `GET /api/reports/export/pdf` downloads a valid PDF
- [ ] Reports page accessible to admin only (403 for others)

---

## Phase 9 — Search, Filters & Pagination

> **Goal:** Add reusable search, filter, and pagination to all list endpoints and UI components.

### 9.1 Backend Pattern

All list endpoints accept:
```
?search=<term>&page=<n>&limit=<n>&status=<value>&sortBy=<field>&order=asc|desc
```

Generic pagination helper:
```js
// utils/paginate.js
const paginate = (page = 1, limit = 10) => ({
  skip: (page - 1) * limit,
  take: parseInt(limit),
});
```

Return format:
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

### 9.2 Frontend Components

- `src/components/common/SearchBar.jsx` — debounced input (300ms) that updates query params
- `src/components/common/Pagination.jsx` — previous/next/numbered page buttons
- `src/components/common/Table.jsx` — generic sortable table with loading skeleton
- `src/hooks/useFetch.js` — custom hook for data fetching with loading/error states

### 9.3 Deliverables Checklist
- [ ] Search works on customers, policies, and claims list pages
- [ ] Pagination renders and navigates correctly
- [ ] Status filter dropdown narrows results correctly
- [ ] `useFetch` hook handles loading and error states cleanly
- [ ] `meta` object returned from all list endpoints

---

## Phase 10 — Frontend UI & Role-Based Access

> **Goal:** Build all remaining pages, shared layout, and enforce role-based guards in the UI.

### 10.1 Shared Layout

`src/components/common/Navbar.jsx`:
- Shows logged-in user name and role
- Logout button clears token and redirects to `/login`

`src/components/common/Sidebar.jsx`:
- Navigation links filtered by user role:
  - **Admin**: Dashboard, Customers, Policies, Claims, Payments, Documents, Reports
  - **Agent**: Dashboard, Customers, Policies, Claims, Payments, Documents
  - **Customer**: Dashboard, My Policies, My Claims, Payments, My Documents

### 10.2 Protected Route Implementation

`src/routes/ProtectedRoute.jsx`:
```jsx
const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(role)) return <Navigate to="/unauthorized" />;
  return children;
};
```

### 10.3 Router Setup

`src/routes/AppRouter.jsx`:
```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="customers" element={<ProtectedRoute roles={['admin','agent']}><CustomerListPage /></ProtectedRoute>} />
    <Route path="reports" element={<ProtectedRoute roles={['admin']}><ReportsPage /></ProtectedRoute>} />
    {/* ... all other routes */}
  </Route>
</Routes>
```

### 10.4 Shared UI Components

- `Modal.jsx` — generic confirm/form modal with backdrop
- `StatusBadge.jsx` — colored pill for active/expired/cancelled/pending/approved/rejected

### 10.5 Deliverables Checklist
- [ ] Sidebar shows only role-appropriate links
- [ ] Admin-only routes return to `/unauthorized` for non-admins
- [ ] Customer-only routes (submit claim) blocked for agents/admins
- [ ] Layout wraps all protected pages with Navbar + Sidebar
- [ ] Logout clears token and redirects to `/login`

---

## Phase 11 — Validation & Error Handling

> **Goal:** Robust Zod validation on all POST/PUT routes, global error middleware, and toast notifications in UI.

### 11.1 Backend Validators

Ensure all write endpoints have Zod validators:

| Module | Schema Fields |
|---|---|
| Auth | `name, email, password, role?` |
| Customer | `name, dob, phone, address, email` |
| Policy | `customerId, policyType, premiumAmount, startDate, endDate` |
| Claim | `policyId, claimAmount, reason` |
| Payment | `policyId, paymentDate, amount` |

Validator middleware wrapper:
```js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.errors });
  }
  req.body = result.data;
  next();
};
```

### 11.2 Global Error Middleware

`src/middleware/errorMiddleware.js` handles:
- `ZodError` → 400 with field-level errors
- Prisma `P2025` → 404 Record not found
- Prisma `P2002` → 409 Duplicate entry
- Generic → 500 Internal Server Error

Must be registered **last** in `app.js`:
```js
app.use(errorMiddleware);
```

### 11.3 Frontend Error Handling

- Axios response interceptor catches 401 → redirect to login
- Form components display field-level validation errors from API
- Global toast/notification system via `AppContext.addNotification()`

```jsx
// Example toast usage
const { addNotification } = useAppContext();
try {
  await createCustomer(formData);
  addNotification('Customer created successfully', 'success');
} catch (err) {
  addNotification(err.response?.data?.message || 'Error occurred', 'error');
}
```

### 11.4 Deliverables Checklist
- [ ] All POST/PUT routes reject invalid data with descriptive errors
- [ ] `errorMiddleware` is the last middleware in `app.js`
- [ ] Prisma errors (P2025, P2002) return correct HTTP codes
- [ ] Toast notifications appear on success and failure in UI
- [ ] Forms show field-level validation errors next to inputs

---

## Phase 12 — Testing & Bug Fixes

> **Goal:** Systematically test all API endpoints with Postman and fix discovered bugs.

### 12.1 Postman Collection Structure

Create a Postman collection with folders:
```
Insurance Management Platform
├── Auth          (register, login, me)
├── Customers     (CRUD + history)
├── Policies      (CRUD + renew + cancel)
├── Claims        (list + submit + approve/reject)
├── Payments      (list + record)
├── Documents     (upload + list + download)
└── Reports       (dashboard + charts + pdf)
```

### 12.2 Test Scenarios

| Scenario | Expected Result |
|---|---|
| Register duplicate email | 409 Conflict |
| Login with wrong password | 401 Unauthorized |
| Access protected route without token | 401 Unauthorized |
| Customer accesses `/api/reports` | 403 Forbidden |
| Create policy with missing fields | 400 Validation error |
| Upload file > 5MB | 400 File too large |
| Upload `.exe` file | 400 Invalid file type |
| Approve claim as customer | 403 Forbidden |
| Search customers: `?search=non_existent` | 200 with empty array |
| Paginate beyond last page | 200 with empty array |

### 12.3 Deliverables Checklist
- [ ] Postman collection created and all endpoints tested
- [ ] All test scenarios pass with correct HTTP codes
- [ ] No unhandled promise rejections in server logs
- [ ] Frontend console has no errors during normal flows

---

## Phase 13 — UI Polish & Responsive Design

> **Goal:** Make the UI fully responsive and polished with Tailwind CSS.

### 13.1 Responsive Breakpoints

Apply Tailwind responsive prefixes:

| Breakpoint | Width | Layout Change |
|---|---|---|
| `sm` | 640px | Stack cards vertically |
| `md` | 768px | Show sidebar as overlay |
| `lg` | 1024px | Full sidebar + content layout |
| `xl` | 1280px | Wider content area |

### 13.2 Responsive Patterns

- **Sidebar**: Hidden on mobile (`hidden md:flex`), hamburger menu toggles it
- **Tables**: Horizontal scroll on small screens (`overflow-x-auto`)
- **Stat cards**: 1-column on mobile, 2-column on `md`, 4-column on `lg`
- **Forms**: Full-width inputs on mobile, 2-column grid on `md`
- **Charts**: Fixed height on mobile, responsive on `lg`

### 13.3 UI Quality Checklist

- [ ] Application is usable on 375px (iPhone SE) viewport
- [ ] Tables are horizontally scrollable on mobile
- [ ] Sidebar collapses on mobile with hamburger menu
- [ ] All form inputs have visible focus states
- [ ] Color contrast meets WCAG AA standards
- [ ] Loading skeletons shown while data fetches
- [ ] Empty states shown when lists have no data

---

## Phase 14 — Deployment & Documentation

> **Goal:** Deploy frontend to Vercel, backend to Render/Railway, connect managed PostgreSQL.

### 14.1 Database Setup (Render/Railway)

1. Create a managed **PostgreSQL** instance on Render or Railway
2. Copy the `DATABASE_URL` connection string
3. Set it as an environment variable on the backend service
4. Run `npx prisma migrate deploy` against production DB

### 14.2 Backend Deployment (Render / Railway)

1. Connect GitHub repository
2. Set root directory to `server/`
3. Build command: `npm install && npx prisma generate`
4. Start command: `node server.js`
5. Add environment variables:
   ```
   DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, CLIENT_URL, NODE_ENV
   ```
6. Enable auto-deploy on push to `main`

### 14.3 Frontend Deployment (Vercel)

1. Import GitHub repository in Vercel
2. Set root directory to `client/`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.render.com/api
   ```
6. Enable auto-deploy on push to `main`

### 14.4 Post-Deployment Verification

- [ ] Backend health check: `GET /api/auth/me` returns 401 (server is live)
- [ ] Frontend loads without console errors
- [ ] Login flow works end-to-end in production
- [ ] File upload works in production
- [ ] PDF export downloads correctly in production
- [ ] CORS only allows requests from Vercel domain

### 14.5 Final Documentation

Update `README.md` with:
- Project description
- Live demo URL (Vercel)
- Local setup instructions (`npm install`, `.env` setup, `prisma migrate dev`, `npm run dev`)
- Postman collection link
- Architecture diagram reference
- Tech stack table

### 14.6 Deliverables Checklist
- [ ] Backend deployed and publicly accessible
- [ ] Frontend deployed on Vercel
- [ ] All environment variables set correctly in production
- [ ] End-to-end login, policy creation, claim submission tested on production
- [ ] `README.md` updated with setup and deployment instructions

---

## Dependency Graph

```
Phase 0 (Setup)
    └─► Phase 1 (DB + Server)
            └─► Phase 2 (Auth)
                    └─► Phase 3 (Customers)
                    │       └─► Phase 4 (Policies)
                    │               ├─► Phase 5 (Payments)
                    │               └─► Phase 6 (Claims)
                    │                       └─► Phase 7 (Documents)
                    └─► Phase 8 (Reports)  ← depends on Phases 3–6
                                └─► Phase 9 (Search & Pagination)
                                        └─► Phase 10 (UI + Role Guards)
                                                └─► Phase 11 (Validation & Errors)
                                                        └─► Phase 12 (Testing)
                                                                └─► Phase 13 (Polish)
                                                                        └─► Phase 14 (Deploy)
```

---

## Tech Stack Reference

| Layer | Technology | Phase Introduced |
|---|---|---|
| Frontend | React.js + Vite | Phase 0 |
| Styling | Tailwind CSS | Phase 0 |
| State | Context API | Phase 2 |
| HTTP Client | Axios + Interceptors | Phase 2 |
| Routing | React Router v6 | Phase 10 |
| Charts | Chart.js + react-chartjs-2 | Phase 8 |
| Backend | Node.js + Express.js | Phase 1 |
| ORM | Prisma | Phase 1 |
| Database | PostgreSQL | Phase 1 |
| Auth | JWT + bcrypt | Phase 2 |
| Validation | Zod | Phase 11 |
| File Upload | Multer | Phase 7 |
| PDF | PDFKit | Phase 8 |
| Hosting (FE) | Vercel | Phase 14 |
| Hosting (BE) | Render / Railway | Phase 14 |

---

*Implementation plan derived from [architecture.md](./architecture.md) and [context.md](./context.md)*
