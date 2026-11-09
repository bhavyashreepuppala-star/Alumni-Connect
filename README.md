# Alumni Connect — Professional Collegiate Networking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A premium, institutional-grade professional networking platform engineered to connect college students, distinguished alumni, and university administration.

---

## 🌟 Platform Highlights

- **Tripartite Role Architecture**: Tailored dashboards and workflows for **Students**, **Alumni**, and **Administration**.
- **Alumni Credential Verification**: Audit-grade degree verification queue ensuring only authentic graduates receive mentor badges.
- **Official LinkedIn Integration**: Compliant OAuth 2.0 and OpenID Connect (OIDC) architecture for 1-click verification and authorized job referral amplification.
- **Relational Integrity via MySQL 8 & Prisma**: Strict schema definitions with indexes, foreign keys, and unique constraints.
- **Modern UI/UX Design System**: Deep navy blue palette (`#0F2744`), clean cards, subtle micro-interactions, responsive typography, and full dark-blue contrast.
- **Comprehensive Observability**: Independent health monitoring for the Express backend and the MySQL database engine.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn-inspired primitives, React Router 6, TanStack Query 5, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript (Strict Mode), Zod validation, Helmet, CORS, Morgan |
| **Database** | **MySQL 8** (Strict application database, managed exclusively via **Prisma ORM**) |
| **Security & Auth** | JWT, bcryptjs, cryptographic CSRF tokens, strict input validation |
| **Services** | Socket.IO (Realtime), LinkedIn OIDC (Auth), Nodemailer (Email), Cloudinary (Documents) |

---

## 📁 Repository Structure

```
Alumni Connect/
├── package.json               # Root monorepo workspace configuration
├── .gitignore                 # Security rules: ignores .env, secrets, builds
├── .env.example               # Root environment variable template
├── docs/
│   ├── ARCHITECTURE.md        # Technical architecture & ER diagrams
│   └── LINKEDIN_INTEGRATION.md# LinkedIn OAuth 2.0 & OpenID Connect spec
├── server/
│   ├── package.json
│   ├── tsconfig.json          # NodeNext strict TypeScript settings
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma      # Relational MySQL schema
│   │   └── seed.ts            # Development database seed script
│   └── src/
│       ├── config/            # Zod env schema & Prisma client singleton
│       ├── controllers/       # Health and Auth endpoints
│       ├── middleware/        # Centralized error handler & 404 handler
│       ├── routes/            # Express router modules
│       ├── services/          # LinkedIn, Cloudinary, Nodemailer architectures
│       ├── utils/             # ApiResponse & AppError classes
│       ├── app.ts             # Express application assembly
│       └── server.ts          # Server initialization with Socket.IO
└── client/
    ├── package.json
    ├── tsconfig.json          # Vite bundler strict settings
    ├── vite.config.ts         # Bundler config with /api proxy
    ├── tailwind.config.js     # Deep navy & slate design tokens
    └── src/
        ├── components/
        │   ├── ui/            # Button, Card, Badge, Input primitives
        │   ├── common/        # Navbar (with live DB badge), Footer
        │   └── landing/       # High-conversion landing page sections
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── dashboards/    # Student, Alumni, and Admin portals
        │   └── NotFoundPage.tsx
        ├── lib/               # API clients & query client
        ├── App.tsx            # Route configuration
        └── main.tsx           # Entry point
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20 or v24+
- **npm**: v10+
- **MySQL 8.0**: Installed and running locally on port `3306`

### 2. Install Dependencies
Run from the root directory to install packages across both workspaces:
```bash
npm install
```

### 3. Configure Database & Environment
1. Copy the environment configuration:
   ```bash
   cp server/.env.example server/.env
   ```
2. Verify or update `server/.env` with your local MySQL credentials:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/alumni_connect"
   ```

3. Ensure MySQL 8 is running, then generate the Prisma client and apply the migration:
   ```bash
   # Run from root
   npm run prisma:generate
   npm run prisma:migrate -- --name init_phase_1
   npm run prisma:seed
   ```

*(Alternatively, if running commands directly inside the `server/` folder:)*
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init_phase_1
npx prisma db seed
cd ..
```

### 4. Run the Application Locally
You can run both client and server concurrently with one command:
```bash
npm run dev
```

Or run them individually:
- **Backend API Server**: `npm run dev:server` (Starts at `http://localhost:5000`)
- **Frontend Client**: `npm run dev:client` (Starts at `http://localhost:5173`)

---

## 👥 Seeded Demo Accounts for Testing

The seed script creates ready-to-test accounts representing all three roles with pre-hashed credentials:

| Role | Email Address | Password | Profile Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@alumniconnect.edu` | `Password123!` | Director of Alumni Relations with access to verification desk |
| **Alumni** | `sarah.chen@alumni.edu` | `Password123!` | Verified Alumnus (Google Staff SWE) with active mentorship slots |
| **Student** | `alex.rivera@student.edu` | `Password123!` | 3rd-year CS student with verified skill badges |

*On the `/login` page, you can click the **Auto-fill** button to instantly populate these credentials!*

---

## 📡 API Endpoints (Phase 1)

### Diagnostic Health Checks
- `GET /api/health`
  - Separately tests the Node.js Express process and executes a `SELECT 1` ping against MySQL.
  - Returns `200 OK` with JSON diagnostics (status: `"ok"` or `"degraded"`, latency, uptime, memory usage).

### Authentication & Demo Accounts
- `POST /api/auth/register` — Validates role-specific attributes and creates user in transaction.
- `POST /api/auth/login` — Authenticates credentials, compares bcrypt hashes, and returns JWT.
- `GET /api/auth/demo-accounts` — Returns safe test credentials for developer testing.

### LinkedIn Integration Architecture
- `GET /api/linkedin/status` — Checks if LinkedIn OAuth credentials are configured.
- `GET /api/linkedin/auth-url` — Generates official LinkedIn OAuth 2.0 authorization URL with cryptographically secure CSRF state.

---

## 🔐 LinkedIn Integration Architecture

See [`docs/LINKEDIN_INTEGRATION.md`](docs/LINKEDIN_INTEGRATION.md) for full architecture details:
- Uses official standard scopes: `openid`, `profile`, `email`, `w_member_social`.
- Complies strictly with LinkedIn Developer Platform terms.
- Zero web scraping, zero credential interception.
- Stores identity assertions cleanly in the `LinkedAccount` relational table.

---

## 🛡️ License

Built for university institutional networks. Distributed under the MIT License.
