'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import AdminGate from '@/features/auth/components/AdminGate';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AdminSidebar from '@/components/layout/AdminSidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { reportError } from '@/lib/errors';
import { endSession } from '@/lib/auth/session';
import { logout } from '@/features/auth/services/authService';

const navLabels: Record<string, string> = {
  '/admin-dashboard': 'Overview',
  '/admin-users': 'Users',
  '/admin-projects': 'Projects',
  '/admin-activity': 'Activity',
  '/admin-analytics': 'Analytics',
  '/admin-profile': 'Profile',
};

function AdminShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: unknown) {
      reportError(error);
    } finally {
      endSession('logout');
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <LoadingSpinner variant="admin" message="Verifying access..." />;
  }

  return (
    <div className="admin-shell fixed inset-0 flex overflow-hidden">
      <div className="admin-mobile-bar fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          <span className="text-sm font-bold">Orbit Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"
          aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <div className="admin-main flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="admin-header relative z-30 mt-14 flex h-16 flex-shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:mt-0 md:px-8">
          <div className="hidden items-center gap-2 text-sm md:flex">
            <span className="text-gray-600">Admin</span>
            <span className="mx-1 text-gray-700">/</span>
            <span className="font-medium text-white">{navLabels[pathname] || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 sm:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <span className="text-xs font-semibold text-red-400">Admin Mode</span>
            </div>
            <div className="ml-2">
              <ThemeToggle compact />
            </div>
          </div>
        </header>
        <main className="admin-content flex-1 overflow-auto p-4 sm:p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
