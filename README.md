# Orbit - Intelligent Task & Project Management

A comprehensive AI-powered task management and project planning platform with real-time collaboration, analytics, and intelligent automation.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Authentication & Security](#authentication--security)
- [API Integration](#api-integration)
- [Contributing](#contributing)

## 🎯 Project Overview

**Orbit** is a full-stack application designed to help teams and individuals manage projects and tasks efficiently with AI-powered insights, Kanban workflows, and real-time collaboration.

**Frontend**: React 18 + Next.js 16 (App Router) application with modern dark-mode UI/UX  
**Backend**: Express.js REST API with MongoDB database via Prisma ORM  

## ✨ Features

### User Features
- 📊 **Dashboard**: Overview of projects, tasks, and analytics
- 📁 **Project Management**: Create, edit, and organize projects with collaborative team rosters
- ✅ **Task Management**: Interactive Kanban board with drag-and-drop, task lists, and priority tagging
- 🧠 **AI Analytics**: Intelligent task workload summaries and focus area recommendations
- 📈 **Analytics**: Productivity metrics and progress tracking
- 🔔 **Notifications**: Real-time task updates and mentions via WebSockets
- 👤 **Profile Management**: User profile customization and custom avatar uploads
- 🔑 **Password Recovery**: Secure forgot-password email requests and reset-password validation flows
- 🔍 **Global Search**: Deep search across tasks and projects
- 📎 **File Attachments**: Upload, display, and manage files on individual tasks

### Admin Features
- 👥 **User Management**: View, delete, and modify user roles in a comprehensive users list with avatar support
- 📊 **System Analytics**: Platform-wide analytics, user sign-up counts, and project stats
- 📢 **Global Broadcast**: Send real-time announcements/notifications to all active users
- 📁 **Platform Audit**: Complete project listing and administrative oversight

### Security Features
- 🔐 **Unified Cookie-Only JWT Auth**: Tokens set as server-only `HttpOnly`, `SameSite` cookies (no local storage exposure)
- 🛡️ **Cross-Session Isolation**: Automatic token clearing on new logins/refreshes to prevent admin/user credential conflicts
- ⚡ **CSRF Protection**: Dual-cookie pattern with custom headers (`X-CSRF-Token`) for state-changing operations
- 👮 **Role-Based Access Control**: Strict middleware verification for admin-only and user-only routes
- 🔒 **Data Encryption**: Secure credential hashing using bcrypt (12 rounds) and parameter validation

## 🏗️ Architecture

### Frontend Architecture
```
NextJS App Router
├── User Routes (/user_features)
│   ├── Dashboard
│   ├── Projects
│   ├── Tasks
│   ├── Analytics
│   ├── Notifications
│   └── Profile
├── Admin Routes (/admin_features)
│   ├── Dashboard
│   ├── Users
│   ├── Activity
│   ├── Analytics
│   └── Projects
├── Auth Routes
│   ├── Login
│   ├── Register
│   └── Admin Login
└── Public Routes
    ├── Homepage
    └── Landing
```

### State Management
- **Redux Toolkit**: Centralized state management for auth, user data
- **Custom Hooks**: Reusable logic for common operations
- **Cookies**: Secure token persistence with HTTP-only flags

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts for analytics
- **Icons**: Lucide Icons
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (Access & Refresh tokens)
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: Custom middleware

## 📁 Project Structure

```
orbit/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── admin_features/     # Admin dashboard pages
│   │   │   ├── user_features/      # User dashboard pages
│   │   │   ├── login/              # Login page
   │   │   ├── register/           # Registration page
│   │   │   ├── admin-login/        # Admin login page
│   │   │   ├── homepage/           # Home page
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Index page
│   │   ├── components/             # Reusable components
│   │   ├── lib/                   # Utilities & helpers
│   │   └── store/                 # Redux store
│   ├── public/                     # Static assets
│   └── package.json
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   ├── routes/                # API routes
│   │   ├── middlewares/           # Auth & custom middleware
│   │   ├── services/              # Business logic (AI, etc.)
│   │   └── utils/                 # Utilities
│   ├── prisma/                    # MongoDB schema
│   └── package.json
└── README.md
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (Atlas Cluster or local MongoDB instance)
- npm or yarn

### Frontend Setup

1. **Install dependencies**:
```bash
cd client
npm install
```

2. **Create environment file** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

3. **Run development server**:
```bash
npm run dev
```

4. **Open application**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Install dependencies**:
```bash
cd server
npm install
```

2. **Configure environment** (`.env`):
```env
DATABASE_URL=mongodb+srv://user:password@cluster0.mongodb.net/orbit?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

3. **Generate Prisma Client & Push Collections**:
```bash
npx prisma generate
npx prisma db push
```

4. **Start server**:
```bash
npm start
```

## 💻 Development

### Available Scripts

**Frontend**:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

**Backend**:
```bash
npm start        # Start server
npm run dev      # Start with nodemon
```

## 🔐 Authentication & Security

### Auth Flow

1. **User Login**:
   - User submits credentials
   - Backend validates and returns access & refresh tokens
   - Tokens stored in HTTP-only cookies

2. **Token Refresh**:
   - Axios interceptor checks token expiration
   - Automatically requests new access token using refresh token
   - Updates cookie with new token

3. **Session Persistence**:
   - On page refresh, app rehydrates auth from cookies
   - No need for user to re-login

4. **Logout**:
   - Clear auth cookies
   - Clear Redux state
   - Redirect to login page

### Security Measures
- ✅ HTTP-only cookies prevent XSS token theft
- ✅ JWT tokens for stateless authentication
- ✅ Refresh token rotation for enhanced security
- ✅ Protected routes with auth guards
- ✅ Type-safe error handling
- ✅ CORS enabled for safe cross-origin requests

## 📚 Available Routes

### User Routes
- `/user_features/dashboard` - User dashboard
- `/user_features/projects` - Projects list
- `/user_features/projects/[id]` - Project kanban board
- `/user_features/tasks` - All tasks
- `/user_features/analytics` - Analytics dashboard
- `/user_features/notifications` - Notifications
- `/user_features/profile` - User profile

### Admin Routes
- `/admin_features/dashboard` - Admin dashboard
- `/admin_features/users` - User management
- `/admin_features/projects` - Projects overview
- `/admin_features/activity` - Activity log
- `/admin_features/analytics` - System analytics

### Public Routes
- `/` - Homepage
- `/login` - User login
- `/register` - User registration
- `/admin-login` - Admin login
- `/homepage` - Landing page
- `/forgot-password` - Request a password reset link
- `/reset-password` - Reset password using validation token

## 📝 License

MIT License - see LICENSE file for details
