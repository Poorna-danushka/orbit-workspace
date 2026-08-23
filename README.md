# Orbit - Collaborative Task & Project Management

A modern, full-stack collaborative project and task management platform featuring real-time synchronization, Kanban workflows, role-based administration, Cloudinary media storage, and Firebase authentication.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Setup & Installation](#-setup--installation)
- [Authentication & Security](#-authentication--security)
- [Available Routes](#-available-routes)
- [License](#-license)

---

## 🎯 Project Overview

**Orbit** is a high-performance productivity platform designed for seamless team collaboration and administrative governance:
- **Frontend**: Built with **Next.js 16 (App Router)**, **React 18**, **Tailwind CSS**, and **Redux Toolkit**, featuring an ultra-responsive dark UI.
- **Backend**: **Node.js + Express.js** REST API coupled with **MongoDB Atlas** managed through **Prisma ORM**, **Socket.io** for real-time events, and **Cloudinary** for image storage.

---

## ✨ Key Features

### 👤 User Workspace (`/user_features`)
- 📊 **Dynamic Dashboard**: Overview of assigned tasks, active projects, progress metrics, and upcoming deadlines.
- 📁 **Project Management**: Create, edit, organize projects, and manage team collaborator rosters.
- 📋 **Kanban Board & Tasks**: Drag-and-drop Kanban columns (`Todo`, `In Progress`, `Completed`), priority badges, due dates, and quick task creation.
- 📎 **Task Attachments**: Upload and manage file attachments associated with specific tasks.
- 🔔 **Real-Time Notifications**: Live updates for task assignments, project invites, and admin broadcasts powered by WebSockets.
- 🖼️ **Profile & Cloudinary Avatar**: Update display name, securely change passwords, and upload custom display pictures directly to **Cloudinary CDN**.
- 🔍 **Global Deep Search**: Instant search indexing across projects, tasks, and team members.

### 🛡️ Admin Governance (`/admin_features`)
- 📈 **Platform Dashboard & Analytics**: System-wide performance metrics, user growth charts (Recharts), and productivity meters.
- 👥 **User Management**: Comprehensive account list with search, role promotion/demotion (`user` ⇄ `admin`), self-deletion safeguards, and full cascading account deletion.
- 📁 **Project Oversight**: Administrative control to inspect and delete any platform project with cascading child cleanup.
- 📢 **Global Broadcasts**: Send real-time announcements/notifications to all active platform users.
- 👤 **Admin Profile**: Dedicated admin profile management (`/admin_features/profile`) with Cloudinary DP upload, password rotation, and security status.

### 🔐 Authentication & Security
- 🌐 **Firebase Google OAuth**: One-click Google sign-in and registration with automatic profile syncing.
- 🔒 **Unified HttpOnly JWT Cookies**: Access and refresh tokens stored strictly in `HttpOnly`, `SameSite` cookies to prevent XSS.
- 🛡️ **Cross-Session Isolation**: Automatic token clearing on new logins/refreshes to prevent admin/user credential conflicts.
- ⚡ **CSRF Protection**: Dual-cookie pattern with custom `X-CSRF-Token` headers for state-changing operations.
- 👮 **Role-Based Access Control (RBAC)**: Middleware enforcement ensuring users and admins access only authorized endpoints.
- 🔑 **Password Recovery Flow**: Forgot password email requests and secure token-based password reset flows.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: Next.js 16.2+ (App Router)
- **UI Library**: React 18
- **State Management**: Redux Toolkit (with cookie rehydration)
- **Styling & Animations**: Tailwind CSS + Lucide Icons
- **HTTP Client**: Axios with automatic token refresh & FormData interceptors
- **Authentication**: Firebase Authentication (Google OAuth)
- **Data Visualization**: Recharts
- **Real-Time**: Socket.io-client

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database & ORM**: MongoDB Atlas + Prisma ORM
- **Cloud Storage**: Cloudinary SDK (Direct memory stream uploads)
- **Real-Time Communication**: Socket.io
- **Security & Utilities**: Helmet, CORS, Express Rate Limit, bcrypt, JSONWebToken, Multer

---

## 📁 Project Structure

```
Orbit-workspace/
├── client/                              # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/                        # App Router Pages
│   │   │   ├── admin_features/         # Admin Pages (dashboard, users, projects, activity, analytics, profile)
│   │   │   ├── user_features/          # User Pages (dashboard, projects, tasks, analytics, notifications, profile)
│   │   │   ├── login/                  # Login Page (Email/Password & Google OAuth)
│   │   │   ├── register/               # Registration Page (Email/Password & Google OAuth)
│   │   │   ├── forgot-password/        # Password Reset Request
│   │   │   ├── reset-password/         # Token-based Password Reset
│   │   │   ├── homepage/               # Public Landing Page
│   │   │   ├── layout.tsx              # Root Layout with Redux & Theme Providers
│   │   │   └── page.tsx                # Entry Redirection
│   │   ├── components/                 # UI components
│   │   ├── lib/                        # API clients, axios interceptors, token storage, firebase
│   │   └── store/                      # Redux Toolkit Slices (auth)
│   └── package.json
│
├── server/                              # Express.js Backend
│   ├── src/
│   │   ├── config/                     # Prisma, Cloudinary, Environment configuration
│   │   ├── controllers/                # Business logic (auth, user, admin, project, task, dashboard, notification)
│   │   ├── middlewares/                # JWT Auth, Admin RBAC, CSRF, Error & Security Handlers
│   │   ├── routes/                     # REST API Route Declarations
│   │   ├── sockets/                    # Socket.io connection and room event handlers
│   │   └── utils/                      # Cloudinary upload stream utilities, JWT generators
│   ├── prisma/                         # Prisma MongoDB schema definition
│   ├── scripts/                        # Database seeders (e.g., create-admin.js)
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Frontend (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/orbit?retryWrites=true&w=majority"
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Poorna-danushka/orbit-app.git
cd Orbit-workspace
```

### 2. Backend Setup
```bash
cd server
npm install

# Push schema to MongoDB Atlas
npx prisma generate
npx prisma db push

# (Optional) Seed Admin Account
node scripts/create-admin.js

# Start backend development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Available Routes

| Route | Role | Description |
|---|---|---|
| `/homepage` | Public | Public landing page |
| `/login` | Public | User & Admin login (Email/Password & Google OAuth) |
| `/register` | Public | User registration (Email/Password & Google OAuth) |
| `/forgot-password` | Public | Password recovery link request |
| `/reset-password` | Public | Reset password with token |
| `/user_features/dashboard` | User | User metrics, task overview, and quick-add |
| `/user_features/projects` | User | Projects list, creation, editing, and collaborator management |
| `/user_features/projects/[id]` | User | Interactive Kanban board with drag-and-drop |
| `/user_features/tasks` | User | Comprehensive task list with priority filters |
| `/user_features/profile` | User | User profile editing, password change, Cloudinary DP upload |
| `/admin_features/dashboard` | Admin | Admin metrics, quick actions, and broadcast announcements |
| `/admin_features/users` | Admin | User account administration with role changes and cascade delete |
| `/admin_features/projects` | Admin | Platform-wide project auditing and management |
| `/admin_features/activity` | Admin | Real-time audit log of system events |
| `/admin_features/analytics` | Admin | System growth charts and task completion rates |
| `/admin_features/profile` | Admin | Dedicated Admin Profile management with Cloudinary DP upload |

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
