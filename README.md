# Insurance Management Platform 🛡️

A full-stack, enterprise-grade Insurance Management Platform built with **Node.js, Express, PostgreSQL, Prisma ORM, React (Vite), Tailwind CSS**, and **Groq LLM Intelligence**.

[![Repo](https://img.shields.io/badge/GitHub-Necro000%2FInsurance--Management--Platform-indigo)](https://github.com/Necro000/Insurance-Management-Platform)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Key Features

- **🔐 Multi-Role RBAC Authentication**: Secure JWT-based auth with `Admin`, `Agent`, and `Customer` role isolation.
- **👥 Customer Management**: Complete client profile management, policy history, contact records, and search.
- **📜 Policy Management**: Issue new policies, automatic 1-year renewals, cancellations, and status tracking.
- **💰 Premium Tracking**: Payment recording, auto-detection of overdue premiums, and revenue reporting.
- **⚠️ Claim Processing**: Policyholder claim submissions and role-gated `Admin`/`Agent` approval & rejection workflows.
- **📄 Document Upload & Download**: Multer disk storage (JPEG, PNG, PDF ≤ 5MB) with relative path sanitization and disk file verification.
- **📊 Reports & Dashboard**: Aggregated stats, interactive Chart.js visualizations (Bar, Line, Pie), and one-click PDF Report Generation via PDFKit.
- **🤖 Groq LLM Integration**: Fast AI-assisted intelligence wrapper integrated into the backend stack.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React.js (Vite) |
| **Styling & Design** | Tailwind CSS v3 (Dark Mode & Glassmorphism) |
| **Charts & Analytics** | Chart.js & `react-chartjs-2` |
| **Backend Framework** | Node.js & Express.js (v5) |
| **ORM & Database** | Prisma ORM & PostgreSQL |
| **Authentication** | JSON Web Token (JWT) & `bcryptjs` |
| **Validation** | Zod Schema Validation |
| **File Storage** | Multer Disk Storage |
| **PDF Generation** | PDFKit |
| **LLM Provider** | Groq SDK (`groq-sdk`) |

---

## 📂 Project Architecture

```
insurance-management-platform/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/                # Axios API call modules
│   │   ├── components/         # Reusable UI, Charts, Modals, Forms
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── pages/              # Dashboard, Customers, Policies, Claims, Payments, Documents, Reports
│   │   ├── routes/             # ProtectedRoute & AppRouter
│   │   └── utils/              # Axios instance & formatting helpers
│   └── vercel.json             # Vercel SPA routing rewrite configuration
├── server/                     # Node.js Express Backend
│   ├── prisma/                 # Database schema & migrations
│   ├── src/
│   │   ├── config/             # DB & Groq clients
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, Role, Upload, and Global Error handlers
│   │   ├── routes/             # API routes (/api/auth, /api/customers, etc.)
│   │   ├── services/           # Business logic & aggregations
│   │   ├── utils/              # Response helpers, pagination, PDF generator
│   │   └── validators/         # Zod schemas
│   └── server.js               # Entry point
└── DOCS/                       # Comprehensive documentation
    ├── architecture.md
    ├── implementation-plan.md
    ├── edge-cases.md
    └── postman_collection.json # Official Postman API Collection
```

---

## 🚀 Local Development Setup

### 1. Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: Running instance locally or via cloud (Neon, Supabase, Render, Railway)

### 2. Environment Variables

Create `.env` files in both `server/` and `client/`:

#### `server/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/insurance_db?schema=public
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_groq_api_key
```

#### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Installation & Database Setup

```bash
# Clone the repository
git clone https://github.com/Necro000/Insurance-Management-Platform.git
cd Insurance-Management-Platform

# Setup Backend
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev

# Setup Frontend (in a separate terminal)
cd ../client
npm install
npm run dev
```

The application will be accessible at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 📬 Postman API Collection

Import the included Postman collection to test all API endpoints:
- **File Path**: [`DOCS/postman_collection.json`](./DOCS/postman_collection.json)

Folders included:
1. `Auth` (Register, Login, `/me` profile)
2. `Customers` (List, Create, Get by ID)
3. `Policies` (List, Create, Renew, Cancel)
4. `Claims` (List, Submit, Approve/Reject)
5. `Payments` (List, Record payment)
6. `Documents` (List, Download)
7. `Reports` (Dashboard stats, PDF export)

---

## 🌐 Production Deployment

- **Backend (Render / Railway)**:
  - Root directory: `server/`
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `node server.js`
- **Frontend (Vercel)**:
  - Root directory: `client/`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 📄 License

This project is licensed under the MIT License.
