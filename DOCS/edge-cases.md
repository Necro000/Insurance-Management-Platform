# Edge Cases & Corner Cases
## Insurance Management Platform

> Derived from [`implementation-plan.md`](./implementation-plan.md) and [`architecture.md`](./architecture.md)  
> Use this document during **Phase 11 (Validation)**, **Phase 12 (Testing)**, and code reviews.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Customer Management](#2-customer-management)
3. [Policy Management](#3-policy-management)
4. [Premium Tracking](#4-premium-tracking)
5. [Claim Management](#5-claim-management)
6. [Document Upload](#6-document-upload)
7. [Reports & Dashboard](#7-reports--dashboard)
8. [Search, Filters & Pagination](#8-search-filters--pagination)
9. [Database & Prisma](#9-database--prisma)
10. [Role-Based Access Control](#10-role-based-access-control)
11. [API & Network Layer](#11-api--network-layer)
12. [Frontend UI & State](#12-frontend-ui--state)
13. [Deployment & Environment](#13-deployment--environment)

---

## 1. Authentication & Authorization

### 1.1 Registration

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-A01 | Register with an **already existing email** | Duplicate user created | Return `409 Conflict` — "Email already in use" |
| EC-A02 | Register with **password less than 6 characters** | Weak passwords stored | Return `400 Bad Request` from Zod validator |
| EC-A03 | Register with **email missing `@` or domain** | Invalid email stored | Return `400` — Zod `.email()` rejects it |
| EC-A04 | Register with **empty `name` field** | Nameless user created | Return `400` — Zod `.min(2)` rejects it |
| EC-A05 | Register with **extra unknown fields** in body (`admin: true`) | Privilege escalation via body | Zod `.strict()` strips unknown keys or rejects |
| EC-A06 | Register with **`role: "admin"`** passed by client | User self-promotes to admin | `role` field should be ignored on public register; only set by admin |
| EC-A07 | Register with **whitespace-only name** (`"   "`) | Invalid name passes min(2) | Trim + validate: `.trim().min(2)` in Zod schema |
| EC-A08 | Register with **extremely long email** (> 254 chars) | DB overflow / unexpected error | Add `.max(254)` constraint in Zod and DB |

---

### 1.2 Login

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-A09 | Login with **wrong password** | Attacker guessing passwords | Return `401 Unauthorized` — never expose "wrong password" vs "user not found" |
| EC-A10 | Login with **non-existent email** | Attacker enumerates valid emails | Return same generic `401` as wrong password |
| EC-A11 | Login with **correct credentials but deleted/suspended user** | Deleted user still logs in | Check user existence before signing token |
| EC-A12 | Login request body **completely empty** | Server crash / unhandled error | Return `400` from Zod validator |
| EC-A13 | **Concurrent login** with same credentials from two devices | N/A (JWT is stateless) | Both succeed — each holds a valid independent token |

---

### 1.3 JWT & Middleware

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-A14 | Request with **no Authorization header** | Unauthenticated access | Return `401 Unauthorized` |
| EC-A15 | Request with **malformed token** (`Bearer abc123`) | Server crash or bypass | `jwt.verify` throws → return `401` |
| EC-A16 | Request with **expired JWT** | Expired session still works | `jwt.verify` throws `TokenExpiredError` → return `401` |
| EC-A17 | Request with **`Bearer` keyword missing** (only token sent) | Middleware fails silently | Middleware must handle `header.split(' ')` carefully |
| EC-A18 | **JWT_SECRET** is empty or undefined in env | All tokens invalid or unsignable | Throw startup error if `JWT_SECRET` is not set |
| EC-A19 | User role **changed after JWT issued** (e.g., demoted from admin) | Old token still has old role | JWT is stateless — role change only takes effect on next login; document this |

---

## 2. Customer Management

### 2.1 Create Customer

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-C01 | Create customer with **duplicate email** | Two customers share one email | Return `409 Conflict` (Prisma P2002) |
| EC-C02 | Create customer with **date of birth in the future** | Invalid age stored | Validate: `dob` must be in the past; return `400` |
| EC-C03 | Create customer with **age < 18** (minor) | Legal/compliance issue | Validate: customer must be ≥ 18 years old |
| EC-C04 | Create customer with **phone number containing letters** | Invalid phone stored | Validate phone format with regex in Zod |
| EC-C05 | Create customer with **phone shorter than 10 digits** | Invalid contact info | Zod `.min(10)` on phone field |
| EC-C06 | Create customer with **all-whitespace address** | Empty address stored | Trim + validate non-empty address |

---

### 2.2 Read & Update Customer

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-C07 | `GET /customers/:id` with **non-existent ID** | Server crash or empty data | Return `404 Not Found` (Prisma P2025) |
| EC-C08 | `GET /customers/:id` with **non-numeric ID** (`/customers/abc`) | Prisma query fails | Validate that `:id` is a positive integer |
| EC-C09 | `PUT /customers/:id` with **no changed fields** (empty body) | Unnecessary DB write | Return `400` — at least one field must be provided |
| EC-C10 | **Customer tries to view another customer's profile** | Data breach | Enforce: customers can only view their own profile |
| EC-C11 | `GET /customers/:id/history` for customer **with no policies** | Null reference / crash | Return empty arrays: `{ policies: [], claims: [] }` |

---

## 3. Policy Management

### 3.1 Create Policy

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-P01 | Create policy with **`end_date` before `start_date`** | Invalid date range stored | Validate: `endDate > startDate`; return `400` |
| EC-P02 | Create policy with **`start_date` in the past** | Backdated policy issued | Warn or reject depending on business rule; validate |
| EC-P03 | Create policy with **`premium_amount` of 0 or negative** | Free or negative insurance | Validate: `premiumAmount > 0` |
| EC-P04 | Create policy for a **non-existent customer ID** | Orphaned policy | Prisma foreign key constraint → return `400` with clear message |
| EC-P05 | Create policy with **duplicate `policy_number`** | Unique constraint violated | Handle Prisma P2002 → return `409 Conflict` |
| EC-P06 | Create policy with **`policy_number` generated that already exists** (collision) | Auto-generation collision | Add retry logic or use UUID instead of timestamp-based number |
| EC-P07 | Create policy with **extremely large `premium_amount`** (e.g., `999999999999`) | DB Decimal overflow | Add `.max()` constraint in Zod |

---

### 3.2 Renew & Cancel Policy

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-P08 | Renew an **already active** policy (not yet expired) | Unintended extension | Allow with warning, or block — document the business rule |
| EC-P09 | Renew an **already cancelled** policy | Cancelled policy becomes active | Return `400` — cancelled policies cannot be renewed |
| EC-P10 | Cancel a policy that **has pending claims** | Claims become orphaned | Return `400` — resolve or reject pending claims first |
| EC-P11 | Cancel an **already cancelled** policy | Idempotency issue | Return `400` — "Policy is already cancelled" |
| EC-P12 | Cancel/renew policy with **non-existent ID** | Server crash | Return `404 Not Found` |
| EC-P13 | **Customer tries to cancel their own policy** | Unauthorized action | Return `403 Forbidden` (only Admin can cancel) |

---

## 4. Premium Tracking

### 4.1 Record Payments

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-PM01 | Record payment for a **non-existent policy** | Orphaned payment | Prisma FK constraint → return `400` |
| EC-PM02 | Record payment for a **cancelled policy** | Payment on dead policy | Return `400` — "Cannot record payment for a cancelled policy" |
| EC-PM03 | Record payment with **amount of 0 or negative** | Invalid transaction stored | Validate: `amount > 0` |
| EC-PM04 | Record **duplicate payment** for the same date and policy | Double payment logged | Warn user or return `409` if same date+policy already has a `paid` record |
| EC-PM05 | Record payment with **payment_date in the future** | Future-dated transactions | Validate: `paymentDate <= today` |
| EC-PM06 | **Concurrent payment submissions** for the same policy at the same time | Race condition / duplicate | Use DB transaction or unique constraint on `(policyId, paymentDate)` |

---

### 4.2 Overdue Logic

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-PM07 | **Overdue batch job runs** while a payment is being recorded simultaneously | Payment marked overdue just after being paid | Use transactions; check `paymentStatus = 'pending'` before updating |
| EC-PM08 | Policy has **no payments yet** but is past start date | Not flagged as overdue | Treat first premium as overdue if past first due date |
| EC-PM09 | `markOverdue()` called **multiple times** in the same day | Idempotency issue | Ensure update is a no-op for already-overdue records |

---

## 5. Claim Management

### 5.1 Submit Claims

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-CL01 | Submit claim for a **policy that doesn't belong to the customer** | Fraudulent claim | Validate: `policy.customerId === req.user.customerId` |
| EC-CL02 | Submit claim for an **expired or cancelled policy** | Claim on inactive policy | Return `400` — "Policy is not active" |
| EC-CL03 | Submit claim with **`claim_amount` greater than policy `premium_amount`** | Unusually large claim | Flag for review, or validate against a configured claim limit |
| EC-CL04 | Submit claim with **`claim_amount` of 0 or negative** | Invalid claim amount | Validate: `claimAmount > 0` |
| EC-CL05 | Submit claim with **empty or whitespace-only `reason`** | Undescribed claim stored | Validate: `reason.trim().length > 0` |
| EC-CL06 | Submit claim for a **policy that already has an open (pending) claim** | Multiple simultaneous claims | Define business rule: allow or block; document it |
| EC-CL07 | Submit claim with **non-existent `policy_id`** | Orphaned claim | Return `404` — policy not found |

---

### 5.2 Approve / Reject Claims

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-CL08 | Approve/reject a claim that is **already approved or rejected** | Status overwritten silently | Return `400` — "Claim has already been processed" |
| EC-CL09 | `PATCH /claims/:id/status` with **invalid status value** (e.g., `"closed"`) | Invalid enum stored | Zod validates `status` is one of `['approved', 'rejected']` only |
| EC-CL10 | **Customer tries to approve their own claim** | Unauthorized action | Return `403 Forbidden` |
| EC-CL11 | Approve/reject claim with **non-existent ID** | Server crash | Return `404 Not Found` |
| EC-CL12 | Approve claim with **no notes or reason** (when business requires it) | Audit trail missing | Consider making an `agentNotes` field required on status update |

---

## 6. Document Upload

### 6.1 File Validation

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-D01 | Upload a file **larger than 5MB** | Server overloaded / storage exhausted | Multer `limits.fileSize` triggers → return `400` "File too large" |
| EC-D02 | Upload a **file with disallowed MIME type** (e.g., `.exe`, `.zip`, `.js`) | Malicious file execution | `fileFilter` rejects → return `400` "Invalid file type" |
| EC-D03 | Upload a file with **MIME type spoofed** (`.exe` renamed to `.pdf`) | MIME spoofing bypass | Use `file-type` library to verify actual file contents, not just MIME header |
| EC-D04 | Upload **no file at all** (empty multipart request) | `req.file` is undefined → crash | Check `if (!req.file)` in controller → return `400` |
| EC-D05 | Upload file with a **filename containing special characters** (e.g., `../../etc/passwd`) | Path traversal attack | Multer `filename` callback must sanitize; never use raw `originalname` as path |
| EC-D06 | Upload file with an **extremely long filename** (> 255 chars) | Filesystem error | Truncate filename to safe length before saving |
| EC-D07 | Upload file for a **non-existent customer** | Orphaned document record | Validate customer exists before saving document metadata |

---

### 6.2 Download

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-D08 | Download document with **non-existent ID** | DB returns null → crash | Return `404 Not Found` |
| EC-D09 | Document record exists in DB but **file was deleted from disk** | `res.download()` throws error | Check `fs.existsSync(filePath)` before calling `res.download()` → return `500` with clear message |
| EC-D10 | **Customer downloads another customer's document** | Data breach | Validate: `document.customerId === req.user.customerId` |
| EC-D11 | Download request for **non-numeric document ID** | Prisma query crash | Validate `:id` is a positive integer |

---

## 7. Reports & Dashboard

### 7.1 Dashboard Aggregations

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-R01 | **No data exists yet** (fresh system, no customers/policies) | Charts render with no data / crash | Return zeroes and empty arrays; Chart.js renders empty state gracefully |
| EC-R02 | `SUM` of premium payments when **all payments are null** | Prisma returns `null` for `_sum.amount` | Default to `0`: `result._sum.amount ?? 0` |
| EC-R03 | Customer growth query when **no customers in last 6 months** | Empty array returned | Frontend must handle empty array without crashing Chart.js |
| EC-R04 | Dashboard stats fetched **concurrently** (`Promise.all`) and **one query fails** | Entire dashboard breaks | Add individual try/catch or fallback values per query |
| EC-R05 | Report filtered for **a month with no activity** | Null results / division by zero | Return `0` for counts and sums |

---

### 7.2 PDF Export

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-R06 | PDF export requested with **no data** (empty tables) | Empty/broken PDF generated | Render "No records found" message in the PDF |
| EC-R07 | PDF export with **very large dataset** (1000s of records) | Response timeout or memory spike | Paginate data or limit to last N records; add a warning in the PDF header |
| EC-R08 | PDF export **interrupted mid-stream** (client disconnects) | Incomplete file saved | Use `res.on('close', ...)` to detect disconnect and end the PDFKit stream |
| EC-R09 | **Non-admin** user hits the PDF export endpoint directly via URL | Unauthorized access | `requireRole('admin')` middleware returns `403` |

---

## 8. Search, Filters & Pagination

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-S01 | `?page=0` or `?page=-1` | Skip becomes negative | Validate: `page >= 1`; default to `1` if invalid |
| EC-S02 | `?limit=0` | `take: 0` returns no results silently | Validate: `limit >= 1`; default to `10` |
| EC-S03 | `?limit=10000` (very large limit) | DB query fetches entire table | Cap limit at a maximum (e.g., `100`): `Math.min(limit, 100)` |
| EC-S04 | `?page=999` (beyond last page) | Empty array returned | Return `200` with empty `data: []` and correct `meta.totalPages` |
| EC-S05 | `?search=` (empty search string) | Treated as a search for empty string | Treat as "no search filter"; return all records |
| EC-S06 | `?search=<SQL injection string>` | SQL injection via `contains` | Prisma parameterizes all queries — safe by default; still validate input type |
| EC-S07 | `?search=<XSS string>` (`<script>alert(1)</script>`) | XSS via search results displayed in UI | Sanitize/escape output in React; React escapes by default in JSX |
| EC-S08 | `?status=invalid_value` | Filter returns wrong results or error | Validate `status` against allowed enum values before querying |
| EC-S09 | `?sortBy=nonExistentField` | Prisma throws or sorts by wrong field | Whitelist allowed `sortBy` fields; default to `createdAt` |
| EC-S10 | Search term with **only whitespace** (`?search=   `) | Matches everything or returns empty | Trim search term before applying filter |

---

## 9. Database & Prisma

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-DB01 | **Database connection fails** on startup | Server starts but all requests fail | Check DB connection on startup; exit process if unreachable |
| EC-DB02 | **Prisma migration not run** in production | Tables don't exist → runtime errors | Run `prisma migrate deploy` in CI/CD pipeline before starting server |
| EC-DB03 | **Cascading delete**: delete a customer who has policies/claims | DB FK constraint violation or orphaned records | Define `onDelete: Cascade` or `Restrict` explicitly in Prisma schema |
| EC-DB04 | **Delete a policy** that has active claims and payments | Orphaned claims/payments | Use `onDelete: Cascade` for payments and claims; or block deletion |
| EC-DB05 | Prisma query times out under **heavy concurrent load** | 500 errors under load | Add connection pooling (PgBouncer or Prisma Data Proxy for production) |
| EC-DB06 | **`Decimal` field precision loss** for `premium_amount` and `claim_amount` | Financial data corrupted | Use `Decimal` type in Prisma (not `Float`); validate to 2 decimal places |
| EC-DB07 | `prisma.user.findUnique()` returns **`null`** for a valid ID | Controller doesn't check null → crash | Always check `if (!record)` before accessing properties |
| EC-DB08 | Two simultaneous requests try to **create the same policy number** | Duplicate key on concurrent insert | Prisma `@unique` constraint triggers P2002 → catch and return `409` |

---

## 10. Role-Based Access Control

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-RB01 | **Customer accesses** `GET /api/customers` (list all) | Data breach — sees all customers | `requireRole('admin', 'agent')` → return `403` |
| EC-RB02 | **Customer accesses** `GET /api/reports/dashboard` | Business data exposed | `requireRole('admin')` → return `403` |
| EC-RB03 | **Agent tries to cancel a policy** | Unauthorized action | `requireRole('admin')` on `PATCH /policies/:id/cancel` → return `403` |
| EC-RB04 | **Customer tries to approve a claim** | Unauthorized action | `requireRole('admin', 'agent')` → return `403` |
| EC-RB05 | **Customer queries policies** — should see only their own | Sees all customers' policies | Filter by `customerId = req.user.customerId` for customer role |
| EC-RB06 | **Customer queries claims** — should see only their own | Sees all claims | Filter by customer's policy IDs for customer role |
| EC-RB07 | **Customer queries payments** — should see only their own | Sees all payments | Filter by customer's policy IDs for customer role |
| EC-RB08 | **Role field missing from JWT payload** (malformed token) | Role check fails or crashes | Default to most restrictive role or return `403` |
| EC-RB09 | Frontend sidebar shows **admin links to customer** (if role guard fails) | UI exposes restricted routes | `ProtectedRoute` component double-checks role server-side and via API |
| EC-RB10 | User **navigates directly via URL** to `/reports` without admin role | Page loads before API call fails | `ProtectedRoute` checks role from `AuthContext` before rendering |

---

## 11. API & Network Layer

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-API01 | Request with **`Content-Type` missing** for POST body | Body parsed as undefined | Express returns `400` or body is `{}` — Zod catches the missing fields |
| EC-API02 | Request body is **valid JSON but wrong type** (array instead of object) | `req.body` is array → `.name` is undefined | Zod schema catches top-level type mismatch |
| EC-API03 | **Very large request body** (e.g., 100MB JSON payload) | DoS via memory exhaustion | Set `express.json({ limit: '1mb' })` to cap body size |
| EC-API04 | `PATCH` request sent to an endpoint that **only accepts `PUT`** | 404 or wrong handler | Ensure correct HTTP method is used; document all methods |
| EC-API05 | **CORS blocked** — frontend on different domain than allowed | API call fails in browser | Configure `cors({ origin: process.env.CLIENT_URL })` strictly |
| EC-API06 | **Axios timeout** — backend takes too long to respond | Request hangs forever | Set `axiosInstance.defaults.timeout = 10000` (10s) on frontend |
| EC-API07 | Frontend sends request while **JWT is expiring in < 1 second** | Token valid when sent, expired on arrival | Backend must validate token on receipt; return `401` gracefully |
| EC-API08 | **Network offline** when user submits a form | Silent failure or crash | Axios catches network error → show "No internet connection" toast |
| EC-API09 | Backend returns `500` for an **unhandled promise rejection** | Stack trace exposed in response | Global `errorMiddleware` catches all unhandled errors; never leak stack traces |
| EC-API10 | Route parameter `:id` is `0` | Prisma finds no record | Validate `:id > 0`; Prisma will return null or P2025 |

---

## 12. Frontend UI & State

### 12.1 AuthContext & Session

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-UI01 | User **closes and reopens tab** — is token still valid? | User logged out unexpectedly | Read token from `localStorage` on app mount; validate with `GET /api/auth/me` |
| EC-UI02 | **`localStorage` is disabled** (private/incognito mode) | Token storage fails → crash | Wrap `localStorage` calls in try/catch; use `sessionStorage` as fallback |
| EC-UI03 | **JWT expires while user is actively using the app** | Next API call returns `401` → redirect to login | Axios interceptor catches `401` → clear token → redirect `/login` |
| EC-UI04 | User **logs out in one tab** — other tabs still think they're logged in | Stale auth state | Listen for `storage` events to sync logout across tabs |
| EC-UI05 | **Two users logged in on the same browser** (different tabs) | Token overwrite | Only last login's token is stored; document this limitation |

---

### 12.2 Forms & Inputs

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-UI06 | User **submits form twice rapidly** (double-click submit) | Duplicate records created | Disable submit button after first click; re-enable on response |
| EC-UI07 | User **navigates away** while a form submission is in progress | Orphaned API call | Cancel request with `AbortController` on component unmount |
| EC-UI08 | **Form fields cleared** when navigating back | User loses entered data | Use `useRef` or retain state in parent; warn before navigating away |
| EC-UI09 | **Copy-pasted input with leading/trailing spaces** in email or name | Invalid data stored | Trim inputs before submitting to API |
| EC-UI10 | **Date picker allows invalid dates** (e.g., Feb 30) | Invalid date sent to API | Use HTML `<input type="date">` which prevents invalid dates natively |

---

### 12.3 Data Display

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-UI11 | API returns **empty list** for a module | Blank page with no feedback | Show "No records found" empty state with an illustration or CTA |
| EC-UI12 | API returns **very long string** (e.g., 1000-char address) | UI layout breaks | Use CSS `overflow: hidden; text-overflow: ellipsis` on table cells |
| EC-UI13 | **Chart renders with `null` data points** | Chart.js throws error or renders incorrectly | Replace `null` values with `0` before passing to Chart.js |
| EC-UI14 | **Date displayed without formatting** (raw ISO string shown) | Poor UX | Use `formatDate.js` util to format all dates consistently (e.g., `DD MMM YYYY`) |
| EC-UI15 | **Currency displayed without formatting** (raw decimal `1234.5`) | Confusing for users | Format as locale currency: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` |
| EC-UI16 | User **refreshes on a protected page** | React Router loses route state | Persist auth in `localStorage`; `AuthContext` rehydrates on mount |
| EC-UI17 | **Pagination shows incorrect page** after a delete operation | Page 3 of 3 becomes page 3 of 2 | After delete, if current page > totalPages, navigate to last valid page |

---

## 13. Deployment & Environment

| # | Edge Case | Risk | Expected Behaviour |
|---|---|---|---|
| EC-ENV01 | `JWT_SECRET` **not set** in production environment | `jwt.sign()` throws → all logins fail | Validate required env vars on startup; crash with clear error message |
| EC-ENV02 | `DATABASE_URL` **incorrect or unreachable** in production | All Prisma queries fail → 500s | Startup health check; log clear error message |
| EC-ENV03 | **`prisma migrate deploy` not run** after adding a new model | Queries fail at runtime | Add migration step to CI/CD pipeline pre-deploy |
| EC-ENV04 | **`uploads/` directory does not exist** on server start | Multer throws when saving files | Create `uploads/` directory programmatically on server startup |
| EC-ENV05 | Frontend `VITE_API_URL` **points to localhost** in production build | All API calls fail in production | Verify `.env.production` has correct production API URL |
| EC-ENV06 | **CORS misconfigured** — `CLIENT_URL` env var not set | All browser requests blocked | Default `CLIENT_URL` to empty string → CORS blocks everything → caught in testing |
| EC-ENV07 | Vercel deployment **builds with wrong Node.js version** | Build fails unexpectedly | Set `engines.node` in `package.json` and specify Node version in Vercel settings |
| EC-ENV08 | Render free tier **spins down after inactivity** | First API call after sleep takes 30+ seconds | Document this limitation; consider a ping service for demo environments |
| EC-ENV09 | **Uploaded files lost on server restart** (ephemeral filesystem on Render) | Documents disappear after deploy | Document limitation; for production, migrate to cloud storage (S3/Cloudinary) |
| EC-ENV10 | **`node_modules/` committed to Git** accidentally | Bloated repo, CI failures | Confirm `.gitignore` includes `node_modules/` before first push |

---

## Quick Reference — HTTP Status Codes for Edge Cases

| Status | Meaning | Common Edge Cases |
|---|---|---|
| `400` | Bad Request | Invalid body, missing fields, Zod failure, wrong date range |
| `401` | Unauthorized | Missing token, expired token, wrong password |
| `403` | Forbidden | Valid token but wrong role |
| `404` | Not Found | Non-existent ID, deleted record |
| `409` | Conflict | Duplicate email, duplicate policy number |
| `413` | Payload Too Large | File upload > 5MB (Multer) |
| `500` | Internal Server Error | Unhandled exception, DB down, disk full |

---

## Edge Case Testing Checklist

Use this as a Postman / manual test checklist during **Phase 12**:

### Auth
- [ ] EC-A01 — Duplicate email registration
- [ ] EC-A09 — Wrong password login (same error as EC-A10)
- [ ] EC-A14 — Request without Authorization header
- [ ] EC-A16 — Expired JWT

### Customer
- [ ] EC-C02 — DOB in the future
- [ ] EC-C07 — Non-existent customer ID
- [ ] EC-C10 — Customer viewing another customer's profile

### Policy
- [ ] EC-P01 — end_date before start_date
- [ ] EC-P03 — premium_amount of 0
- [ ] EC-P09 — Renew a cancelled policy
- [ ] EC-P10 — Cancel policy with pending claims

### Premium
- [ ] EC-PM03 — Payment amount of 0
- [ ] EC-PM05 — Payment date in the future

### Claims
- [ ] EC-CL01 — Submit claim for another customer's policy
- [ ] EC-CL02 — Claim on expired/cancelled policy
- [ ] EC-CL08 — Approve already-approved claim

### Documents
- [ ] EC-D01 — File > 5MB
- [ ] EC-D02 — `.exe` file upload
- [ ] EC-D04 — No file in request
- [ ] EC-D09 — Download when file deleted from disk

### Search & Pagination
- [ ] EC-S01 — `?page=0`
- [ ] EC-S03 — `?limit=10000`
- [ ] EC-S08 — `?status=invalid_value`

### RBAC
- [ ] EC-RB01 — Customer hits `/api/customers`
- [ ] EC-RB02 — Customer hits `/api/reports`
- [ ] EC-RB05 — Customer sees only their own policies

---

*Edge cases derived from [`implementation-plan.md`](./implementation-plan.md) and [`architecture.md`](./architecture.md)*
