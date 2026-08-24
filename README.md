<div align="center">

# 🪐 Orbit

### *Modern Full-Stack Collaborative Task & Project Management Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.2-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_OAuth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Orbit</b> is an enterprise-ready, real-time project management and team collaboration workspace. Designed with a high-performance dark aesthetic, Orbit brings together interactive Kanban boards, live project team chat, tokenized email invitations, automated PDF report generation, granular role-based governance, and rock-solid enterprise security.
</p>

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
  - [👤 User Workspace & Productivity](#-user-workspace--productivity)
  - [🛡️ Administrative Governance & Analytics](#️-administrative-governance--analytics)
  - [⚡ Real-Time Collaboration & Sockets](#-real-time-collaboration--sockets)
  - [🔐 Authentication & Enterprise Security](#-authentication--enterprise-security)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [🗄️ Database Schema & Data Models](#️-database-schema--data-models)
- [📁 Project Directory Structure](#-project-directory-structure)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Setup & Installation](#-setup--installation)
- [📡 API Reference](#-api-reference)
- [🔌 Socket.io Real-Time Events](#-socketio-real-time-events)
- [🗺️ Frontend Route Matrix](#️-frontend-route-matrix)
- [📜 NPM Scripts Reference](#-npm-scripts-reference)
- [🤝 Contributing & License](#-contributing--license)

---

## 🎯 Overview

Orbit streamlines team productivity by eliminating communication silos and providing clear visibility across projects, milestones, and task deliverables:

- **Frontend Application**: Crafted with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Redux Toolkit**, featuring dynamic route handling, accessible UI components, fluid drag-and-drop interactions, and instant responsive layouts.
- **Backend Services**: Robust **Node.js & Express 5** RESTful API paired with **MongoDB Atlas** via **Prisma ORM**, integrating **Socket.io** for real-time synchronization, **Cloudinary** for scalable media delivery, and **Nodemailer (SMTP)** for email delivery.
- **Security-First Foundation**: Dual-token architecture (Access + Refresh tokens stored in `HttpOnly`, `SameSite` cookies), CSRF token enforcement, rate limiting, and Role-Based Access Control (RBAC).

---

## ✨ Key Features

### 👤 User Workspace & Productivity

- 📊 **Dynamic User Dashboard (`/user_features/dashboard`)**:
  - Comprehensive metrics: Total Assigned Tasks, Active Projects, In-Progress Tasks, and Completion Rate.
  - Interactive quick-task creation modal and upcoming deadline overview.
- 📁 **Project Management (`/user_features/projects`)**:
  - Create, customize, edit, and organize project workspaces.
  - Member management: View active team members and invite collaborators.
- 📋 **Interactive Kanban Board (`/user_features/projects/[id]`)**:
  - Fluid drag-and-drop workflow powered by **`@dnd-kit`** across status columns: `Todo`, `In Progress`, `Completed`.
  - Task priority management: `Low`, `Medium`, `High`, `Urgent`.
  - Assignee selectors, due date pickers, and inline task status toggles.
- 💬 **Real-Time Project Chat (`components/chat/ProjectChat.tsx`)**:
  - Dedicated per-project real-time messaging sidebar.
  - Live message broadcasting and persistent message history via Socket.io and MongoDB.
- 📄 **Automated PDF Project Reports**:
  - Instant export of professional project summary reports using **`jsPDF`**.
  - Captures project metadata, task completion statistics, priority distributions, assignee logs, and timestamps.
- 📧 **Tokenized Email Project Invitations**:
  - Invite external and registered users via email with secure expiry tokens powered by **Nodemailer**.
  - Dedicated invitation response portal (`/project-invitations/[token]`) with accept/reject handlers.
- 📎 **Task & Project File Attachments**:
  - Direct file uploads for documents, spreadsheets, images, and PDFs (up to 15MB) backed by **Multer** and **Cloudinary CDN**.
- 🔔 **Live Notification Hub (`/user_features/notifications`)**:
  - Real-time updates for task assignments, project invites, status changes, and global admin broadcasts.
  - Quick actions: Mark individual notifications as read or batch mark all as read.
- 👤 **User Profile & Custom Avatar (`/user_features/profile`)**:
  - Update username and personal details.
  - Direct profile image upload with automatic optimization via **Cloudinary**.
  - Secure in-app password changes with current password verification.
- 🔍 **Global Multi-Entity Search**:
  - Instant search bar querying across projects, tasks, and team members simultaneously.

---

### 🛡️ Administrative Governance & Analytics

- 📈 **Platform Dashboard (`/admin_features/dashboard`)**:
  - System-wide KPIs: Total registered users, total projects, aggregate task metrics, and platform completion velocity.
  - Real-time quick-action broadcast announcement launcher.
- 👥 **User Administration (`/admin_features/users`)**:
  - Paginated and searchable directory of all registered accounts.
  - Dynamic role promotion and demotion (`user` ⇄ `admin`).
  - Self-deletion safeguards and full cascading user deletion (cleaning up memberships, tokens, and assignments).
- 🗂️ **Global Project Oversight (`/admin_features/projects`)**:
  - Audit and inspect any project across the entire organization.
  - Administrative project deletion with cascading cleanup of tasks, attachments, and messages.
- 📊 **Advanced Analytics & Charts (`/admin_features/analytics` & `/user_features/analytics`)**:
  - Interactive data visualizations powered by **Recharts** (Area charts, Bar charts, Pie charts).
  - Productivity metrics, project completion velocity, and user acquisition analytics.
- 📜 **System Activity & Audit Log (`/admin_features/activity`)**:
  - Live chronological audit trail tracking system events, user registrations, and administrative changes.
- 📢 **System-Wide Broadcast System**:
  - Broadcast notifications dispatched in real-time to all connected users via WebSockets and persisted to database.
- 👤 **Dedicated Admin Profile (`/admin_features/profile`)**:
  - Administrative avatar management, password rotation, and security status verification.

---

### ⚡ Real-Time Collaboration & Sockets

Powered by **Socket.io** with dedicated rooms and optimized payloads:
- `joinProject`: Subscribes clients to specific project channels for instant Kanban task state synchronization.
- `joinChat`: Connects team members to live project chat rooms.
- `joinUser`: Binds authenticated user sockets to their private notification stream.
- `taskUpdated` / `taskChanged`: Broadcasts live drag-and-drop card movements and task edits across team members without page reloads.
- `sendMessage` / `messageReceived`: Handles instant per-project chat messaging with sender metadata and persistence.

---

### 🔐 Authentication & Enterprise Security

- 🌐 **Firebase Google OAuth 2.0**: One-click Google authentication with automatic profile creation and avatar synchronization.
- 🔒 **Dual-Token HttpOnly Cookie Architecture**:
  - Short-lived Access Tokens (15 min) + Long-lived Refresh Tokens (7 days) stored exclusively in `HttpOnly`, `SameSite: strict/lax`, `Secure` cookies.
  - Resistant to XSS credential extraction and client-side token leakage.
- 🔄 **Refresh Token Rotation & Revocation**:
  - Refresh tokens are hashed (`SHA-256`) and tracked in MongoDB with expiration and revocation timestamps.
- ⚡ **CSRF Protection**:
  - Double-submit CSRF cookie pattern requiring `X-CSRF-Token` headers for mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- 🛡️ **Cross-Session Isolation**:
  - Comprehensive cookie cleanup on logout or re-authentication to prevent cross-account credential bleed.
- 🔑 **Secure Password Recovery Flow**:
  - One-time password reset tokens (15-minute validity) hashed in the database with secure email dispatch.
- 👮 **Middleware Security Stack**:
  - **Helmet**: Secures HTTP response headers and Content Security Policies (CSP).
  - **Express Rate Limit**: Granular rate limiting on general API routes (1000 req/15 min) and auth endpoints (200 req/15 min).
  - **CORS Protection**: Strict origin verification supporting production domains and local development environments.
  - **bcrypt**: Password hashing with a high cost factor (12 salt rounds).

---

## 🛠️ Tech Stack & Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                    ORBIT SYSTEM ARCHITECTURE                      │
└───────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────┐
  │                   CLIENT LAYER (Next.js 16)                   │
  │  React 19 • Tailwind CSS v4 • Redux Toolkit • @dnd-kit       │
  │  Recharts • jsPDF • Lucide Icons • Socket.io-client          │
  └───────────────────────────────┬───────────────────────────────┘
                                  │ HTTPS / WSS
                                  ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                 BACKEND API LAYER (Express 5)                 │
  │  Helmet • CORS • Cookie-Parser • CSRF • Rate Limit            │
  │  JWT Token Utility • Multer • Nodemailer SMTP                 │
  └───────┬───────────────────────┬───────────────────────┬───────┘
          │                       │                       │
          ▼                       ▼                       ▼
  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
  │  MongoDB &    │       │  Cloudinary   │       │   Socket.io   │
  │  Prisma ORM   │       │  Media CDN    │       │   Real-Time   │
  └───────────────┘       └───────────────┘       └───────────────┘
```

### Core Technologies

| Category | Technology | Version | Description |
|---|---|---|---|
| **Frontend Framework** | [Next.js](https://nextjs.org/) | `16.2.6` | App Router, Server/Client components, SSR & CSR |
| **UI Library** | [React](https://react.dev/) | `19.2.4` | Modern React with Hooks and Concurrent features |
| **Styling Engine** | [Tailwind CSS](https://tailwindcss.com/) | `v4.0.0` | Utility-first styling with `@tailwindcss/postcss` |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | `^2.12.0` | Global authentication state and store hydration |
| **Drag and Drop** | [@dnd-kit](https://dndkit.com/) | `^6.3.1` | Accessible, performant Kanban board interactions |
| **Data Visualization** | [Recharts](https://recharts.org/) | `^3.8.1` | Composable SVG analytics and metric charts |
| **Document Generation**| [jsPDF](https://github.com/parallax/jsPDF) | `^4.2.1` | Client-side dynamic PDF project report exports |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^1.17.0` | Clean, modern UI iconography |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.16.1` | Configured with interceptors & CSRF header syncing |
| **Auth Provider** | [Firebase Auth](https://firebase.google.com/) | `^12.18.0` | Google OAuth 2.0 federated authentication |
| **Backend Runtime** | [Node.js](https://nodejs.org/) | `v18+ / v20+` | Asynchronous JavaScript runtime |
| **Server Framework** | [Express](https://expressjs.com/) | `^5.2.1` | Next-generation Express 5 REST API |
| **Database & ORM** | [Prisma](https://www.prisma.io/) + [MongoDB](https://www.mongodb.com/) | `^5.22.0` | Type-safe database queries and document mapping |
| **Real-Time Engine** | [Socket.io](https://socket.io/) | `^4.8.3` | Low-latency bidirectional WebSocket communication |
| **Cloud Storage** | [Cloudinary](https://cloudinary.com/) | `^2.10.1` | Cloud image and media storage via memory streams |
| **Email Service** | [Nodemailer](https://nodemailer.com/) | `^7.0.0` | SMTP email transport for invitations and alerts |
| **File Handling** | [Multer](https://github.com/expressjs/multer) | `^2.1.1` | Multipart/form-data memory storage handling |
| **Security & Auth** | [JSONWebToken](https://github.com/auth0/node-jsonwebtoken) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | `^9.0.3` / `^6.0.0` | Token signing, verification, and password hashing |
| **Defense & Headers** | [Helmet](https://helmetjs.github.io/) & [Rate-Limit](https://github.com/express-rate-limit/express-rate-limit) | `^8.2.0` / `^8.5.2` | HTTP security headers and endpoint throttling |

---

## 🗄️ Database Schema & Data Models

Managed through **Prisma ORM** targeting **MongoDB Atlas**:

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMember : "belongs to"
    User ||--o{ Task : "assigned to"
    User ||--o{ Notification : "receives"
    User ||--o{ RefreshToken : "holds"
    User ||--o{ PasswordResetToken : "requests"
    User ||--o{ Message : "sends"
    User ||--o{ ProjectInvitation : "invites / invited"
    
    Project ||--o{ Task : "contains"
    Project ||--o{ ProjectMember : "has members"
    Project ||--o{ Attachment : "holds files"
    Project ||--o{ ProjectInvitation : "pending invites"
    Project ||--o{ Message : "contains chats"

    Task ||--o{ Attachment : "holds files"
```

### Models Summary:
- **`User`**: Account identity (`username`, `email`, `password`, `avatar`, `role: "user" | "admin"`, `createdAt`).
- **`RefreshToken`**: Secure refresh token storage with SHA-256 `tokenHash`, `expiresAt`, and `revokedAt`.
- **`PasswordResetToken`**: Recovery token with `tokenHash`, `expiresAt`, and `used` boolean flag.
- **`Project`**: Workspace (`title`, `description`, `ownerId`, `status: "active" | "archived"`, `createdAt`).
- **`ProjectMember`**: Join table mapping `projectId`, `userId`, and `role: "owner" | "admin" | "member"`.
- **`ProjectInvitation`**: Tokenized invite records with `projectId`, `inviterId`, `invitedEmail`, `token`, `status: "pending" | "accepted" | "rejected"`, `expiresAt`.
- **`Task`**: Deliverables with `projectId`, `assignedTo`, `title`, `description`, `status: "Todo" | "In Progress" | "Completed"`, `priority: "Low" | "Medium" | "High" | "Urgent"`, `dueDate`.
- **`Message`**: Project chat messages (`projectId`, `senderId`, `content`, `createdAt`).
- **`Attachment`**: File metadata (`taskId`, `projectId`, `fileName`, `fileUrl`, `createdAt`).
- **`Notification`**: User alert entries (`userId`, `message`, `isRead`, `createdAt`).

---

## 📁 Project Directory Structure

```
Orbit-workspace/
├── package.json                         # Root scripts (postinstall, start)
├── README.md                            # Comprehensive platform documentation
│
├── client/                              # Next.js 16 Frontend Application
│   ├── package.json                     # Client dependencies and scripts
│   ├── next.config.ts                   # Next.js configuration
│   ├── tsconfig.json                    # TypeScript compiler options
│   ├── postcss.config.mjs               # PostCSS configuration with Tailwind v4
│   │
│   └── src/
│       ├── app/                         # Next.js App Router Structure
│       │   ├── layout.tsx               # Root application layout with Redux provider
│       │   ├── page.tsx                 # Root entry redirection
│       │   ├── globals.css              # Tailwind CSS v4 design tokens & base styles
│       │   ├── homepage/                # Public marketing & feature overview page
│       │   ├── login/                   # Email/Password & Google OAuth login page
│       │   ├── register/                # Account registration page
│       │   ├── forgot-password/         # Password reset request portal
│       │   ├── reset-password/          # Tokenized password reset page
│       │   ├── project-invitations/     # Invite resolution page ([token])
│       │   │
│       │   ├── user_features/           # User Workspace Pages
│       │   │   ├── layout.tsx           # User workspace layout with sidebar & topbar
│       │   │   ├── dashboard/           # User dashboard with task KPIs and quick actions
│       │   │   ├── projects/            # Project list, creation, and member management
│       │   │   │   └── [id]/            # Interactive Kanban board, chat & PDF export
│       │   │   ├── tasks/               # Unified personal task list with priority filters
│       │   │   ├── analytics/           # Personal velocity and productivity charts
│       │   │   ├── notifications/       # User notification feed and mark-read controls
│       │   └── profile/                 # Profile settings, avatar upload & password change
│       │   │
│       │   └── admin_features/          # Administrative Control Center
│       │       ├── layout.tsx           # Admin layout with dedicated admin navigation
│       │       ├── dashboard/           # System-wide metrics, KPIs & broadcast modal
│       │       ├── users/               # User management table, role changes & deletion
│       │       ├── projects/            # Platform-wide project auditing and cleanup
│       │       ├── analytics/           # System growth and platform analytics
│       │       ├── activity/            # Real-time system audit & activity log
│       │       └── profile/             # Dedicated admin profile and avatar management
│       │
│       ├── components/                  # Modular UI Components
│       │   ├── chat/
│       │   │   └── ProjectChat.tsx      # Real-time project chat widget with Socket.io
│       │   ├── kanban/
│       │   │   ├── KanbanColumn.tsx     # Drag-and-drop status column container
│       │   │   └── TaskCard.tsx         # Draggable task card with priority badges
│       │   ├── providers/
│       │   │   └── ReduxProvider.tsx    # Redux state provider wrapper
│       │   └── ui/
│       │       └── StatCard.tsx         # Reusable metric card with trend indicators
│       │
│       ├── lib/                         # Utilities, SDKs & Interceptors
│       │   ├── api/                     # Modular API endpoints (auth, user, admin)
│       │   ├── axios.ts                 # Axios instance with CSRF headers & auto-refresh
│       │   ├── config.ts                # Client environment configuration
│       │   ├── firebase.ts              # Firebase client SDK initialization (OAuth)
│       │   └── tokenStorage.ts          # Client token helpers
│       │
│       └── store/                       # State Management (Redux Toolkit)
│           ├── index.ts                 # Central store configuration
│           └── slices/
│               └── authSlice.ts         # User session & authentication state slice
│
└── server/                              # Express 5 REST API & WebSocket Backend
    ├── package.json                     # Backend dependencies and scripts
    ├── prisma/
    │   └── schema.prisma                # Prisma MongoDB schema definition
    ├── scripts/
    │   └── create-admin.js              # Script to bootstrap initial admin account
    │
    └── src/
        ├── index.js                     # Express app setup, middleware, routes, sockets
        ├── config/
        │   ├── cloudinary.js            # Cloudinary SDK credentials configuration
        │   ├── env.js                   # Strict environment variable loader & validation
        │   └── prisma.js                # Singleton Prisma Client instance
        ├── controllers/
        │   ├── admin.controller.js      # Admin stats, users, roles, project oversight
        │   ├── auth.controller.js       # Register, login, Google OAuth, tokens, reset
        │   ├── chat.controller.js       # Project chat history retrieval
        │   ├── dashboard.controller.js  # User-specific statistics calculation
        │   ├── notification.controller.js # Notifications querying and read status
        │   ├── project.controller.js    # Projects CRUD, member and invite handling
        │   ├── search.controller.js     # Global multi-collection search handler
        │   ├── task.controller.js       # Task CRUD, status updates, priority sorting
        │   ├── upload.controller.js     # Memory-stream attachment uploads & deletion
        │   └── user.controller.js       # User profile, password rotation, avatar upload
        ├── middlewares/
        │   ├── admin.middleware.js      # Admin RBAC authorization guard
        │   ├── auth.middleware.js       # JWT cookie authentication verification
        │   ├── error.middleware.js      # Global centralized error handling middleware
        │   └── security.middleware.js   # CSRF double-cookie validation middleware
        ├── routes/                      # REST API routing endpoints
        │   ├── admin.routes.js
        │   ├── auth.routes.js
        │   ├── chat.routes.js
        │   ├── dashboard.routes.js
        │   ├── notification.routes.js
        │   ├── project.routes.js
        │   ├── search.routes.js
        │   ├── task.routes.js
        │   ├── upload.routes.js
        │   └── user.routes.js
        ├── services/
        │   └── email.service.js         # Nodemailer SMTP transport for project invites
        ├── sockets/
        │   └── socketManager.js         # Socket.io connection, room join & event logic
        └── utils/
            ├── cloudinary.util.js       # Streamifier buffer upload to Cloudinary CDN
            └── token.util.js            # JWT access/refresh token generation & hashing
```

---

## ⚙️ Environment Variables

### 1. Client Environment (`client/.env.local`)

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Full URL to the backend API | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SERVER_URL` | **Yes** | Root URL for Socket.io WebSocket connection | `http://localhost:5000` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | **Yes** | Firebase project Web API Key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **Yes** | Firebase Authentication domain | `your-app.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **Yes** | Firebase Project Identifier | `orbit-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | **Yes** | Firebase Storage Bucket URL | `orbit-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | **Yes** | Firebase Cloud Messaging Sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | **Yes** | Firebase Web Application ID | `1:123456789:web:abcdef` |

### 2. Server Environment (`server/.env`)

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `PORT` | No | Server HTTP port (defaults to `5000`) | `5000` |
| `NODE_ENV` | No | Application environment (`development` / `production`) | `development` |
| `CLIENT_URL` | **Yes** | Allowed client origin(s) for CORS & email links | `http://localhost:3000` |
| `DATABASE_URL` | **Yes** | MongoDB connection string for Prisma | `mongodb+srv://user:pass@cluster.mongodb.net/orbit?retryWrites=true&w=majority` |
| `JWT_SECRET` | **Yes** | Secret key for signing Access JWT tokens | `super-secret-access-key-32-chars-min` |
| `JWT_REFRESH_SECRET` | **Yes** | Secret key for signing Refresh JWT tokens | `super-secret-refresh-key-32-chars-min` |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary account cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API Secret | `abcdefghijklmnopqrstuvwxyz012` |
| `SMTP_HOST` | Optional | SMTP mail server hostname for email invitations | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP mail server port (default: `587`) | `587` |
| `SMTP_SECURE` | Optional | Use TLS/SSL (`true` for port 465, else `false`) | `false` |
| `SMTP_USER` | Optional | SMTP authentication username / email | `your-email@gmail.com` |
| `SMTP_PASS` | Optional | SMTP app password or secret | `your-app-password` |
| `MAIL_FROM` | Optional | Sender email header string | `"Orbit Team" <no-reply@orbit.com>` |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: `v18.17.0` or higher (Node.js 20 LTS recommended)
- **MongoDB Atlas** cluster or a local MongoDB database instance
- **Cloudinary** account (free tier available)
- **Firebase Project** with Google Authentication enabled

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Poorna-danushka/orbit-app.git
cd Orbit-workspace
```

---

### Step 2: Backend Setup
```bash
cd server

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env # or create .env using the configuration above

# 3. Generate Prisma client & sync schema with MongoDB
npx prisma generate
npx prisma db push

# 4. (Optional) Bootstrap an initial Admin user
node scripts/create-admin.js

# 5. Start backend development server
npm run dev
```
*The backend API will start on [http://localhost:5000](http://localhost:5000).*

---

### Step 3: Frontend Setup
```bash
cd ../client

# 1. Install dependencies
npm install

# 2. Configure environment
# Create .env.local with your Firebase & API parameters

# 3. Start Next.js development server
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & set HttpOnly cookies |
| `POST` | `/api/auth/google` | Public | Authenticate via Firebase Google OAuth token |
| `POST` | `/api/auth/refresh` | Cookie | Rotate and issue fresh Access Token |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset token email |
| `POST` | `/api/auth/reset-password` | Public | Reset password using one-time token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh token and clear auth cookies |

### CSRF Token (`/api/csrf-token`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/csrf-token` | Public | Retrieve active CSRF token for headers |

### User Profile (`/api/user`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/user/me` | JWT | Get current authenticated user profile |
| `GET` | `/api/user/search` | JWT | Search registered users by query |
| `PATCH` | `/api/user/profile` | JWT | Update profile details (username) |
| `PATCH` | `/api/user/change-password` | JWT | Change password with old password verification |
| `POST` | `/api/user/avatar` | JWT (Multer) | Upload custom profile avatar to Cloudinary CDN |

### Projects (`/api/projects`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/projects` | JWT | List all projects belonging to or shared with user |
| `POST` | `/api/projects` | JWT | Create a new project workspace |
| `GET` | `/api/projects/:id` | JWT | Retrieve specific project details and tasks |
| `PUT` | `/api/projects/:id` | JWT | Update project title or description |
| `DELETE` | `/api/projects/:id` | JWT | Delete project with cascading child cleanup |
| `POST` | `/api/projects/:id/invite` | JWT | Generate and send email project invitation |
| `GET` | `/api/projects/:id/invitations` | JWT | List pending project invitations |
| `GET` | `/api/projects/invitations/:token` | Public | Verify invitation token metadata |
| `POST` | `/api/projects/invitations/:token/accept` | JWT | Accept project invitation |
| `POST` | `/api/projects/invitations/:token/reject` | JWT | Reject project invitation |
| `GET` | `/api/projects/:id/members` | JWT | List active project collaborators |
| `POST` | `/api/projects/:id/members` | JWT | Add collaborator directly |
| `DELETE` | `/api/projects/:id/members/:memberId` | JWT | Remove collaborator from project |

### Tasks (`/api/tasks`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/tasks/my` | JWT | Get tasks assigned to current user |
| `GET` | `/api/tasks/all` | JWT | Get all accessible user tasks across projects |
| `GET` | `/api/tasks/project/:projectId` | JWT | Get all tasks belonging to a project |
| `POST` | `/api/tasks` | JWT | Create a new task deliverable |
| `PUT` | `/api/tasks/:id` | JWT | Update full task details |
| `PATCH` | `/api/tasks/:id/status` | JWT | Update task Kanban status (`Todo`, `In Progress`, `Completed`) |
| `DELETE` | `/api/tasks/:id` | JWT | Delete a task |

### Attachments & Uploads (`/api/uploads`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/uploads/task/:taskId` | JWT (Multer) | Upload file attachment to a task |
| `GET` | `/api/uploads/task/:taskId` | JWT | Retrieve all attachments for a task |
| `POST` | `/api/uploads/project/:projectId` | JWT (Multer) | Upload file attachment to a project |
| `GET` | `/api/uploads/project/:projectId` | JWT | Retrieve all attachments for a project |
| `DELETE` | `/api/uploads/:id` | JWT | Delete an attachment record |

### Project Chat (`/api/chats`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/chats/project/:projectId/messages` | JWT | Fetch project chat message history |

### Notifications (`/api/notifications`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | JWT | Fetch user notification stream |
| `PATCH` | `/api/notifications/:id/read` | JWT | Mark specific notification as read |
| `PATCH` | `/api/notifications/mark-all-read` | JWT | Mark all user notifications as read |

### Dashboard & Search (`/api/dashboard` & `/api/search`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | JWT | Get aggregate user dashboard metrics |
| `GET` | `/api/search?q=:query` | JWT | Global multi-entity search (projects, tasks, members) |

### Admin Governance (`/api/admin`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin RBAC | System-wide statistics and metrics |
| `GET` | `/api/admin/activity` | Admin RBAC | Chronological audit log of system events |
| `GET` | `/api/admin/users` | Admin RBAC | List all platform registered users |
| `PATCH` | `/api/admin/users/:id/role` | Admin RBAC | Promote or demote user role (`user` ⇄ `admin`) |
| `DELETE` | `/api/admin/users/:id` | Admin RBAC | Permanently delete user account with cascading cleanup |
| `GET` | `/api/admin/projects` | Admin RBAC | Platform-wide project auditing list |
| `DELETE` | `/api/admin/projects/:id` | Admin RBAC | Globally delete any project |
| `POST` | `/api/admin/broadcast` | Admin RBAC | Broadcast instant announcement to all platform users |

---

## 🔌 Socket.io Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `joinProject` | Client ➔ Server | `projectId: string` | Joins client to project room for task updates |
| `joinChat` | Client ➔ Server | `projectId: string` | Joins client to project chat room |
| `joinUser` | Client ➔ Server | `userId: string` | Binds socket to private user notification room |
| `taskUpdated` | Client ➔ Server | `{ projectId, taskId, status, priority, ... }` | Emitted when task position or metadata changes |
| `taskChanged` | Server ➔ Client | `{ taskId, status, priority, ... }` | Broadcasted to other team members in project room |
| `sendMessage` | Client ➔ Server | `{ projectId, senderId, content }` | Dispatches new chat message |
| `messageReceived` | Server ➔ Client | `{ id, content, sender: { id, username, avatar }, ... }` | Broadcasts new message to project chat room |

---

## 🗺️ Frontend Route Matrix

```
/
├── /homepage                           # Public landing & feature showcase
├── /login                              # Public authentication portal
├── /register                           # Public registration portal
├── /forgot-password                    # Password reset email request
├── /reset-password                     # Password update with one-time token
├── /project-invitations/[token]        # Project invitation accept/reject page
│
├── /user_features/                     # User Protected Workspace (Role: user / admin)
│   ├── /dashboard                      # User metrics & quick task creator
│   ├── /projects                       # Projects list & team management
│   │   └── /[id]                       # Kanban Board, Chat & PDF Export
│   ├── /tasks                          # Unified personal task manager
│   ├── /analytics                      # Personal productivity & velocity metrics
│   ├── /notifications                  # Live notification feed
│   └── /profile                        # Profile settings & Cloudinary avatar
│
└── /admin_features/                    # Admin Protected Governance (Role: admin only)
    ├── /dashboard                      # System-wide metrics & broadcast dispatcher
    ├── /users                          # User administration & role management
    ├── /projects                       # Platform-wide project oversight
    ├── /analytics                      # Growth charts & system analytics
    ├── /activity                       # Real-time platform audit log
    └── /profile                        # Admin profile management & avatar upload
```

---

## 📜 NPM Scripts Reference

### Root Scripts (`/`)
- `npm run postinstall` - Installs backend dependencies automatically on deployment.
- `npm start` - Starts the backend production server.

### Backend Scripts (`/server`)
- `npm run dev` - Starts server in development mode with `nodemon`.
- `npm start` - Starts server in production mode with `node src/index.js`.
- `npm run build` - Generates Prisma Client.
- `npm run db:push` - Pushes Prisma schema changes to MongoDB Atlas.
- `npm run db:generate` - Regenerates Prisma Client TypeScript/JavaScript definitions.
- `npm run create-admin` - Runs the admin account seeding script.

### Frontend Scripts (`/client`)
- `npm run dev` - Starts Next.js development server on `http://localhost:3000`.
- `npm run build` - Compiles and optimizes Next.js production build.
- `npm run start` - Starts Next.js production server.
- `npm run lint` - Runs ESLint code style and quality checks.

---

## 🤝 Contributing & License

Contributions are always welcome! If you'd like to improve Orbit:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

This project is licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <b>Built with ❤️ by the Orbit Development Team</b>
</div>
