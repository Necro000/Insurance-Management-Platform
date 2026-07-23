# Insurance Management Platform
> **Internship Project Documentation**

---

## Overview

The **Insurance Management Platform** is a comprehensive web-based application designed to simplify and digitize the management of insurance operations. It enables insurance companies, agents, and customers to manage policies, claims, premium payments, and related documents from a centralized platform.

Traditional insurance processes often involve manual paperwork, lengthy approval cycles, and difficulty tracking customer policies. This project automates these workflows by providing a secure and user-friendly system for efficient management of customers, insurance policies, claim requests, premium payments, and reporting.

This project introduces students to real-world enterprise software development concepts such as:
- Role-based authentication
- Workflow management
- File uploads
- Reporting dashboards
- Relational database design
- REST API development

---

## Project Objectives

Students will learn to:
- Design enterprise-level web applications
- Implement role-based authentication
- Build secure REST APIs
- Design relational databases
- Handle file uploads and document management
- Build workflow-based systems
- Generate reports and dashboards
- Perform form validation and error handling
- Deploy full-stack applications

---

## How It Works

The workflow begins when an **administrator or insurance agent** registers a customer and creates an insurance policy. The customer can then:
1. Log in to view policy details
2. Pay premiums
3. Upload required documents
4. Submit claims

Insurance agents review submitted claims, verify attached documents, and either approve or reject them. Administrators monitor business performance through interactive dashboards and reports.

This project demonstrates the **complete lifecycle of an insurance policy** — from customer registration to claim settlement.

---

## Modules

### 1. Customer Management
| Feature | Description |
|---|---|
| Register Customers | Onboard new customers into the system |
| View Customer Profile | View individual customer details |
| Edit Customer Information | Update customer records |
| Search Customers | Look up customers by name or ID |
| Customer History | View a customer's policy and claim history |

### 2. Policy Management
| Feature | Description |
|---|---|
| Create Insurance Policies | Issue new policies for customers |
| View Active Policies | List currently active policies |
| Renew Policies | Extend expiring policies |
| Cancel Policies | Terminate policies when needed |
| Policy Expiry Notifications | Alerts for soon-to-expire policies |

### 3. Claim Management
| Feature | Description |
|---|---|
| Submit Insurance Claims | Customers file new claims |
| Upload Supporting Documents | Attach required evidence files |
| Claim Verification | Agent review of submitted claims |
| Approve or Reject Claims | Final decision on claim outcome |
| Claim History | View all past claim records |

### 4. Premium Tracking
| Feature | Description |
|---|---|
| Record Premium Payments | Log payments made by customers |
| Payment Status | Check if a payment is completed or pending |
| Due Date Tracking | Monitor upcoming payment deadlines |
| Payment History | View all past payments |
| Overdue Premium Alerts | Notify when payments are past due |

### 5. Document Management
| Feature | Description |
|---|---|
| Upload Identity Documents | Submit ID proofs |
| Upload Policy Documents | Attach policy-related files |
| Download Documents | Retrieve uploaded files |
| View Uploaded Files | Browse all documents for a customer |

### 6. Reports Dashboard
| Report | Description |
|---|---|
| Active Policies | Count and list of all currently active policies |
| Expired Policies | Policies that have lapsed |
| Claim Statistics | Overview of approved, rejected, and pending claims |
| Premium Collection | Total premiums collected over time |
| Customer Growth | New customer registrations over time |
| Monthly Business Reports | Comprehensive monthly summaries |

---

## User Roles

### Administrator
- Manage employees
- Manage customers
- Create insurance policies
- Assign claims
- Generate reports
- Manage system settings

### Insurance Agent
- Register customers
- Create policies
- Verify customer documents
- Review claims
- Approve or reject claims
- Update policy information

### Customer
- Register / Login
- View policies
- Download policy documents
- Pay premiums
- Upload claim documents
- Submit claims
- Track claim status

---

## Use Cases

| # | Use Case | Actor | Description |
|---|---|---|---|
| 1 | Customer Registration | Customer | A new customer creates an account and submits identity information |
| 2 | Policy Creation | Insurance Agent | An agent creates a new insurance policy for the customer |
| 3 | Premium Payment | Customer | Customers pay premiums and track payment history |
| 4 | Claim Submission | Customer | Customers submit insurance claims with supporting documents |
| 5 | Claim Verification | Insurance Agent | Agents review submitted claims and verify uploaded documents |
| 6 | Claim Approval | Insurance Agent | After verification, the claim is approved or rejected |
| 7 | Report Generation | Administrator | Admins monitor policy sales, premium collections, and claim statistics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Backend | Node.js |
| Web Framework | Express.js |
| Database | PostgreSQL |
| ORM / Query Builder | Prisma ORM |
| Authentication | JWT + bcrypt |
| File Upload | Multer |
| Validation | Zod / Express Validator |
| Charts & Analytics | Chart.js |
| PDF Generation | PDFKit |
| API Testing | Postman |
| Version Control | Git & GitHub |
| Backend Hosting | Render / Railway |
| Frontend Hosting | Vercel |

---

## Database Schema

### `Users`
| Column | Type |
|---|---|
| id | Primary Key |
| name | String |
| email | String (Unique) |
| password | Hashed String |
| role | Enum (admin, agent, customer) |

### `Customers`
| Column | Type |
|---|---|
| id | Primary Key |
| name | String |
| dob | Date |
| phone | String |
| address | String |
| email | String |

### `Policies`
| Column | Type |
|---|---|
| id | Primary Key |
| customer_id | Foreign Key -> Customers |
| policy_type | String |
| policy_number | String (Unique) |
| premium_amount | Decimal |
| start_date | Date |
| end_date | Date |
| status | Enum (active, expired, cancelled) |

### `Claims`
| Column | Type |
|---|---|
| id | Primary Key |
| policy_id | Foreign Key -> Policies |
| claim_amount | Decimal |
| reason | Text |
| status | Enum (pending, approved, rejected) |
| submission_date | Date |

### `Premium Payments`
| Column | Type |
|---|---|
| id | Primary Key |
| policy_id | Foreign Key -> Policies |
| payment_date | Date |
| amount | Decimal |
| payment_status | Enum (paid, pending, overdue) |

### `Documents`
| Column | Type |
|---|---|
| id | Primary Key |
| customer_id | Foreign Key -> Customers |
| file_name | String |
| file_path | String |
| uploaded_at | Timestamp |

---

## Two-Week Development Schedule

| Day | Tasks |
|---|---|
| Day 1 | Requirement analysis, UI wireframes, Git repository setup |
| Day 2 | Database design and authentication module |
| Day 3 | Customer Management module |
| Day 4 | Policy Management module |
| Day 5 | Premium Tracking module |
| Day 6 | Claim Management module |
| Day 7 | Document Upload module |
| Day 8 | Reports Dashboard with Chart.js |
| Day 9 | Search, Filters, Pagination |
| Day 10 | Role-Based Authorization |
| Day 11 | Validation and Error Handling |
| Day 12 | Testing and Bug Fixes |
| Day 13 | UI Improvements and Responsive Design |
| Day 14 | Deployment, Documentation, and Final Presentation |

---

## Learning Outcomes

After completing this project, students will have hands-on experience with:

- **React.js** component architecture
- **State management** using Context API
- **Express.js** REST API development
- **JWT Authentication**
- **Role-Based Authorization**
- **PostgreSQL** database design
- **Prisma ORM**
- **File Upload** using Multer
- **PDF generation** with PDFKit
- **Search, Filtering and Pagination**
- **Dashboard development** with Chart.js
- **Error handling** best practices
- **API testing** using Postman
- **Full-stack deployment** on Vercel + Render/Railway
