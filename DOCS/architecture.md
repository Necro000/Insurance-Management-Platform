# Architecture — Insurance Management Platform

> A detailed technical architecture reference for developers and interns building the platform.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Architecture](#5-database-architecture)
6. [Authentication & Authorization Flow](#6-authentication--authorization-flow)
7. [API Design](#7-api-design)
8. [File Upload Architecture](#8-file-upload-architecture)
9. [Reporting & Analytics Architecture](#9-reporting--analytics-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Security Architecture](#11-security-architecture)
12. [Error Handling Strategy](#12-error-handling-strategy)

---

## 1. System Architecture Overview

The platform follows a **3-Tier Client-Server Architecture** with a clear separation between the Presentation Layer (React.js), Business Logic Layer (Express.js), and Data Layer (PostgreSQL via Prisma ORM).

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                    │
│              React.js + Tailwind CSS + Chart.js         │
│                  Hosted on: Vercel                      │
└───────────────────────┬─────────────────────────────────┘
                        │  HTTPS / REST API (JSON)
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   BACKEND SERVER                        │
│            Node.js + Express.js REST API                │
│        JWT Auth · Multer · Zod · PDFKit                 │
│                Hosted on: Render / Railway              │
└───────────────────────┬─────────────────────────────────┘
                        │  Prisma ORM
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  DATA LAYER                             │
│                PostgreSQL Database                      │
│   Users · Customers · Policies · Claims · Payments ·   │
│                    Documents                            │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| API Style | REST | Simple, stateless, easy to test with Postman |
| Auth Strategy | JWT (stateless) | Scalable, no session storage needed |
| ORM | Prisma | Type-safe queries, easy migrations, great DX |
| File Storage | Local via Multer | Simple setup for internship scope |
| State Management | React Context API | Lightweight, no external dependency needed |
| Validation | Zod (server) | Schema-based, type-safe input validation |

---

## 2. Folder Structure

### Root Layout

```
insurance-management-platform/
├── client/                  # React.js Frontend
├── server/                  # Node.js + Express Backend
├── DOCS/                    # Project documentation
│   ├── content.txt
│   ├── context.md
│   └── architecture.md
├── .gitignore
└── README.md
```

### Frontend (`client/`)

```
client/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                  # Axios API call functions (per module)
│   │   ├── authApi.js
│   │   ├── customerApi.js
│   │   ├── policyApi.js
│   │   ├── claimApi.js
│   │   ├── paymentApi.js
│   │   ├── documentApi.js
│   │   └── reportApi.js
│   ├── assets/               # Images, icons, static files
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── charts/
│   │   │   ├── BarChart.jsx
│   │   │   ├── LineChart.jsx
│   │   │   └── PieChart.jsx
│   │   └── forms/
│   │       ├── CustomerForm.jsx
│   │       ├── PolicyForm.jsx
│   │       ├── ClaimForm.jsx
│   │       └── PaymentForm.jsx
│   ├── context/              # React Context API providers
│   │   ├── AuthContext.jsx   # User session & role state
│   │   └── AppContext.jsx    # Global app-level state
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── pages/                # Route-level page components
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── customers/
│   │   │   ├── CustomerListPage.jsx
│   │   │   ├── CustomerDetailPage.jsx
│   │   │   └── CustomerFormPage.jsx
│   │   ├── policies/
│   │   │   ├── PolicyListPage.jsx
│   │   │   ├── PolicyDetailPage.jsx
│   │   │   └── PolicyFormPage.jsx
│   │   ├── claims/
│   │   │   ├── ClaimListPage.jsx
│   │   │   ├── ClaimDetailPage.jsx
│   │   │   └── ClaimFormPage.jsx
│   │   ├── payments/
│   │   │   ├── PaymentListPage.jsx
│   │   │   └── PaymentFormPage.jsx
│   │   ├── documents/
│   │   │   └── DocumentsPage.jsx
│   │   └── reports/
│   │       └── ReportsPage.jsx
│   ├── routes/
│   │   ├── AppRouter.jsx     # Main router definition
│   │   └── ProtectedRoute.jsx # Guards routes by role
│   ├── utils/
│   │   ├── axiosInstance.js  # Axios with base URL + auth header
│   │   ├── formatDate.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── tailwind.config.js
└── package.json
```

### Backend (`server/`)

```
server/
├── prisma/
│   ├── schema.prisma         # Database models & relations
│   └── migrations/           # Auto-generated migration files
├── src/
│   ├── config/
│   │   └── db.js             # Prisma Client instance
│   ├── controllers/          # Request handlers (thin layer)
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── policyController.js
│   │   ├── claimController.js
│   │   ├── paymentController.js
│   │   ├── documentController.js
│   │   └── reportController.js
│   ├── routes/               # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── policyRoutes.js
│   │   ├── claimRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── documentRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # Verify JWT token
│   │   ├── roleMiddleware.js  # Check user role (admin/agent/customer)
│   │   ├── uploadMiddleware.js # Multer config for file uploads
│   │   └── errorMiddleware.js # Global error handler
│   ├── services/             # Business logic layer
│   │   ├── authService.js
│   │   ├── customerService.js
│   │   ├── policyService.js
│   │   ├── claimService.js
│   │   ├── paymentService.js
│   │   ├── documentService.js
│   │   └── reportService.js
│   ├── validators/           # Zod schemas for request validation
│   │   ├── authValidator.js
│   │   ├── customerValidator.js
│   │   ├── policyValidator.js
│   │   └── claimValidator.js
│   ├── utils/
│   │   ├── jwtUtils.js       # Sign & verify JWT
│   │   ├── pdfGenerator.js   # PDFKit report generation
│   │   └── responseHelper.js # Standardized API responses
│   └── app.js                # Express app setup
├── uploads/                  # Stored uploaded files
├── .env
├── server.js                 # Entry point
└── package.json
```

---

## 3. Frontend Architecture

### Component Hierarchy

```
App
└── AuthContext.Provider
    └── AppContext.Provider
        └── AppRouter
            ├── PublicRoutes
            │   ├── LoginPage
            │   └── RegisterPage
            └── ProtectedRoute (requires JWT)
                ├── Layout (Navbar + Sidebar)
                │   ├── DashboardPage
                │   │   ├── StatsCard (x4)
                │   │   ├── BarChart
                │   │   ├── LineChart
                │   │   └── PieChart
                │   ├── CustomerListPage
                │   │   ├── SearchBar
                │   │   ├── Table
                │   │   └── Pagination
                │   ├── PolicyListPage
                │   ├── ClaimListPage
                │   ├── PaymentListPage
                │   ├── DocumentsPage
                │   └── ReportsPage
```

### State Management (Context API)

```
AuthContext
├── state: { user, token, role, isAuthenticated }
├── login(credentials) → stores JWT in localStorage
├── logout() → clears token and state
└── getUser() → decodes JWT payload

AppContext
├── state: { loading, notifications, filters }
├── setLoading(bool)
└── addNotification(message, type)
```

### Routing Strategy

| Route | Page | Access |
|---|---|---|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/dashboard` | DashboardPage | All Roles |
| `/customers` | CustomerListPage | Admin, Agent |
| `/customers/:id` | CustomerDetailPage | Admin, Agent |
| `/policies` | PolicyListPage | All Roles |
| `/policies/new` | PolicyFormPage | Admin, Agent |
| `/claims` | ClaimListPage | All Roles |
| `/claims/new` | ClaimFormPage | Customer |
| `/claims/:id` | ClaimDetailPage | All Roles |
| `/payments` | PaymentListPage | All Roles |
| `/documents` | DocumentsPage | All Roles |
| `/reports` | ReportsPage | Admin |

### Axios Instance (API Layer)

```js
// utils/axiosInstance.js
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT automatically to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401 Unauthorized
axiosInstance.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) window.location.href = '/login';
  return Promise.reject(error);
});
```

---

## 4. Backend Architecture

### Request Lifecycle

```
Incoming HTTP Request
        │
        ▼
   Express Router
        │
        ▼
 authMiddleware.js       ← Verifies JWT token
        │
        ▼
 roleMiddleware.js       ← Checks role permission
        │
        ▼
 Zod Validator           ← Validates request body/params
        │
        ▼
   Controller            ← Extracts data, calls service
        │
        ▼
    Service              ← Business logic, calls Prisma
        │
        ▼
   Prisma ORM            ← Executes SQL on PostgreSQL
        │
        ▼
  JSON Response          ← Standard format via responseHelper
```

### Layered Responsibilities

| Layer | File | Responsibility |
|---|---|---|
| Router | `routes/*.js` | Define endpoints and attach middleware |
| Controller | `controllers/*.js` | Parse req/res, call service, return response |
| Service | `services/*.js` | Business logic, database queries via Prisma |
| Middleware | `middleware/*.js` | Auth, roles, file uploads, error handling |
| Validator | `validators/*.js` | Zod schema validation before controller |

### Standard API Response Format

```json
// Success
{
  "success": true,
  "message": "Policy created successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Unauthorized",
  "error": "Token is invalid or expired"
}
```

---

## 5. Database Architecture

### Entity-Relationship Diagram

```
┌──────────┐       ┌─────────────┐       ┌────────────┐
│  Users   │       │  Customers  │       │  Documents │
│──────────│       │─────────────│       │────────────│
│ id (PK)  │       │ id (PK)     │◄──────│ customer_id│
│ name     │       │ name        │       │ file_name  │
│ email    │       │ dob         │       │ file_path  │
│ password │       │ phone       │       │ uploaded_at│
│ role     │       │ address     │       └────────────┘
└──────────┘       │ email       │
                   └──────┬──────┘
                          │ 1
                          │
                          │ N
                   ┌──────▼──────┐
                   │  Policies   │
                   │─────────────│
                   │ id (PK)     │
                   │ customer_id │
                   │ policy_type │
                   │ policy_number│
                   │ premium_amt  │
                   │ start_date  │
                   │ end_date    │
                   │ status      │
                   └──────┬──────┘
                          │ 1
                   ┌───────────────┐
                   │               │
                   │ N             │ N
          ┌────────▼────┐  ┌──────▼──────────┐
          │   Claims    │  │ Premium Payments │
          │─────────────│  │─────────────────│
          │ id (PK)     │  │ id (PK)         │
          │ policy_id   │  │ policy_id       │
          │ claim_amount│  │ payment_date    │
          │ reason      │  │ amount          │
          │ status      │  │ payment_status  │
          │ submit_date │  └─────────────────┘
          └─────────────┘
```

### Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| Customer → Policies | One-to-Many | A customer can hold multiple policies |
| Customer → Documents | One-to-Many | A customer can upload multiple documents |
| Policy → Claims | One-to-Many | A policy can have multiple claims |
| Policy → Premium Payments | One-to-Many | A policy has many payment records |

### Prisma Schema (Reference)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(customer)
  createdAt DateTime @default(now())
}

enum Role {
  admin
  agent
  customer
}

model Customer {
  id        Int        @id @default(autoincrement())
  name      String
  dob       DateTime
  phone     String
  address   String
  email     String
  policies  Policy[]
  documents Document[]
  createdAt DateTime   @default(now())
}

model Policy {
  id             Int              @id @default(autoincrement())
  customerId     Int
  customer       Customer         @relation(fields: [customerId], references: [id])
  policyType     String
  policyNumber   String           @unique
  premiumAmount  Decimal
  startDate      DateTime
  endDate        DateTime
  status         PolicyStatus     @default(active)
  claims         Claim[]
  payments       PremiumPayment[]
  createdAt      DateTime         @default(now())
}

enum PolicyStatus {
  active
  expired
  cancelled
}

model Claim {
  id             Int         @id @default(autoincrement())
  policyId       Int
  policy         Policy      @relation(fields: [policyId], references: [id])
  claimAmount    Decimal
  reason         String
  status         ClaimStatus @default(pending)
  submissionDate DateTime    @default(now())
}

enum ClaimStatus {
  pending
  approved
  rejected
}

model PremiumPayment {
  id            Int           @id @default(autoincrement())
  policyId      Int
  policy        Policy        @relation(fields: [policyId], references: [id])
  paymentDate   DateTime
  amount        Decimal
  paymentStatus PaymentStatus @default(pending)
}

enum PaymentStatus {
  paid
  pending
  overdue
}

model Document {
  id         Int      @id @default(autoincrement())
  customerId Int
  customer   Customer @relation(fields: [customerId], references: [id])
  fileName   String
  filePath   String
  uploadedAt DateTime @default(now())
}
```

---

## 6. Authentication & Authorization Flow

### Registration & Login Flow

```
[Client] POST /api/auth/register
    → Validate body (Zod)
    → Hash password (bcrypt, 10 rounds)
    → Create User in DB (Prisma)
    → Return 201 Created

[Client] POST /api/auth/login
    → Validate body (Zod)
    → Find user by email
    → Compare password (bcrypt.compare)
    → Sign JWT { userId, role, email } (expires: 7d)
    → Return { token, user }

[Client] Stores token in localStorage
[Client] Attaches token as: Authorization: Bearer <token>
```

### JWT Middleware Flow

```
authMiddleware.js
    → Extract token from Authorization header
    → jwt.verify(token, JWT_SECRET)
    → Attach decoded payload to req.user
    → Call next() or return 401 Unauthorized

roleMiddleware.js (e.g., requireRole('admin'))
    → Check req.user.role === required role
    → Call next() or return 403 Forbidden
```

### Role-Based Access Control Matrix

| Endpoint | admin | agent | customer |
|---|:---:|:---:|:---:|
| GET /customers | ✅ | ✅ | ❌ |
| POST /customers | ✅ | ✅ | ❌ |
| GET /policies | ✅ | ✅ | ✅ (own only) |
| POST /policies | ✅ | ✅ | ❌ |
| GET /claims | ✅ | ✅ | ✅ (own only) |
| POST /claims | ✅ | ❌ | ✅ |
| PATCH /claims/:id/status | ✅ | ✅ | ❌ |
| GET /payments | ✅ | ✅ | ✅ (own only) |
| POST /payments | ✅ | ✅ | ✅ |
| POST /documents/upload | ✅ | ✅ | ✅ |
| GET /reports | ✅ | ❌ | ❌ |

---

## 7. API Design

### Auth Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Authenticated |

### Customer Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/customers` | List all customers (with search & pagination) | Admin, Agent |
| POST | `/api/customers` | Register a new customer | Admin, Agent |
| GET | `/api/customers/:id` | Get customer details | Admin, Agent |
| PUT | `/api/customers/:id` | Update customer information | Admin, Agent |
| GET | `/api/customers/:id/history` | Get customer's policy & claim history | Admin, Agent |

### Policy Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/policies` | List all policies | Admin, Agent |
| POST | `/api/policies` | Create a new policy | Admin, Agent |
| GET | `/api/policies/:id` | Get policy details | All |
| PUT | `/api/policies/:id` | Update policy | Admin, Agent |
| PATCH | `/api/policies/:id/renew` | Renew a policy | Admin, Agent |
| PATCH | `/api/policies/:id/cancel` | Cancel a policy | Admin |

### Claim Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/claims` | List all claims | Admin, Agent |
| POST | `/api/claims` | Submit a new claim | Customer |
| GET | `/api/claims/:id` | Get claim details | All |
| PATCH | `/api/claims/:id/status` | Approve or reject claim | Admin, Agent |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/payments` | List all payments | Admin, Agent |
| POST | `/api/payments` | Record a new payment | All |
| GET | `/api/payments/policy/:policyId` | Get payments for a policy | All |

### Document Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/documents/upload` | Upload a document (multipart/form-data) | All |
| GET | `/api/documents/customer/:customerId` | List customer documents | All |
| GET | `/api/documents/:id/download` | Download a file | All |

### Report Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/reports/dashboard` | Dashboard summary stats | Admin |
| GET | `/api/reports/policies` | Policy stats (active/expired) | Admin |
| GET | `/api/reports/claims` | Claim stats by status | Admin |
| GET | `/api/reports/premiums` | Premium collection totals | Admin |
| GET | `/api/reports/export/pdf` | Export report as PDF | Admin |

### Query Parameters (Search & Pagination)

```
GET /api/customers?search=john&page=1&limit=10&sortBy=name&order=asc
GET /api/policies?status=active&page=1&limit=10
GET /api/claims?status=pending&page=1&limit=10
```

---

## 8. File Upload Architecture

### Multer Configuration

```js
// middleware/uploadMiddleware.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
```

### Upload Flow

```
[Client] POST /api/documents/upload (multipart/form-data)
    → uploadMiddleware (Multer saves file to /uploads)
    → Controller receives req.file (file metadata)
    → documentService saves { fileName, filePath, customerId } to DB
    → Returns { id, fileName, filePath }

[Client] GET /api/documents/:id/download
    → documentService fetches filePath from DB
    → res.download(filePath) streams file to client
```

---

## 9. Reporting & Analytics Architecture

### Dashboard Data Flow

```
[Client] DashboardPage mounts
    → GET /api/reports/dashboard
    → reportService runs aggregation queries:
        - COUNT policies WHERE status = 'active'
        - COUNT policies WHERE status = 'expired'
        - COUNT claims WHERE status = 'pending'
        - SUM payments WHERE payment_status = 'paid' (this month)
        - COUNT customers grouped by month (last 6 months)
    → Returns JSON summary
    → Chart.js renders BarChart, LineChart, PieChart
```

### Charts Used

| Chart Type | Data Visualized |
|---|---|
| Bar Chart | Monthly premium collections |
| Line Chart | Customer growth over months |
| Pie Chart | Claims by status (pending/approved/rejected) |
| Stat Cards | Total customers, active policies, pending claims, monthly revenue |

### PDF Export Flow

```
[Admin] Clicks "Export PDF"
    → GET /api/reports/export/pdf
    → PDFKit creates a new document
    → Adds title, date, and summary statistics
    → Adds tables for policies, claims, payments
    → Pipes PDF buffer to res with Content-Type: application/pdf
    → Browser triggers file download
```

---

## 10. Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│                   GitHub Repository              │
│              (Source of Truth / CI)              │
└────────────────┬──────────────────┬──────────────┘
                 │                  │
       Push to main             Push to main
                 │                  │
    ┌────────────▼───┐    ┌────────▼──────────┐
    │    Vercel      │    │  Render / Railway  │
    │  (Frontend)    │    │    (Backend)       │
    │  React.js SPA  │    │  Node.js + Express │
    │  Auto-deploy   │    │  Auto-deploy       │
    └────────────────┘    └────────┬───────────┘
                                   │ Prisma ORM
                          ┌────────▼───────────┐
                          │  PostgreSQL DB      │
                          │  (Managed on        │
                          │   Render / Railway) │
                          └────────────────────┘
```

### Environment Variables

**Backend `.env`**
```env
DATABASE_URL=postgresql://user:password@host:5432/insurance_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
```

**Frontend `.env`**
```env
VITE_API_URL=https://your-backend.render.com/api
```

---

## 11. Security Architecture

| Threat | Mitigation |
|---|---|
| Password exposure | bcrypt hashing (10 salt rounds) |
| Unauthorized API access | JWT verification on every protected route |
| Privilege escalation | Role middleware checks on sensitive routes |
| Invalid input / injection | Zod schema validation on all inputs |
| File upload abuse | MIME type filter + 5MB file size limit |
| Sensitive data in responses | Never return `password` field from DB |
| CORS | Configured to allow only the Vercel frontend origin |

```js
// app.js — CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 12. Error Handling Strategy

### Global Error Middleware (Backend)

```js
// middleware/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Prisma not found error
  if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Record not found' });

  // Prisma unique constraint violation
  if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Duplicate entry' });

  // Zod validation error
  if (err.name === 'ZodError') return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });

  return res.status(status).json({ success: false, message });
};
```

### Frontend Error Handling

```
API call fails
    → Axios interceptor catches error
    → If 401: redirect to /login
    → If 400/422: display field-level validation errors in form
    → If 500: display generic "Something went wrong" toast
    → Loading state reset regardless of outcome
```

### HTTP Status Code Convention

| Code | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid JWT but wrong role |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate record (email, policy number) |
| 500 | Internal Server Error | Unhandled server exceptions |

---

*Architecture document generated from [context.md](./context.md)*
