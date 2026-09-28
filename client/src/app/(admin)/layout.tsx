'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { RootState } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import { getStoredUser } from '@/lib/tokenStorage';
import api from '@/lib/axios';
import { clearAuthTokens } from '@/lib/tokenStorage';
import AdminSidebar from '@/components/layout/AdminSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { clearAdminSession, getVerifiedAdminUser, verifyAdminSession } from '@/lib/adminSession';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(() => !getVerifiedAdminUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      const verified = getVerifiedAdminUser();
      if (verified) {
        dispatch(setCredentials({ user: verified }));
        setChecking(false);
        return;
      }

      const stored = getStoredUser();
      if (stored) {
        dispatch(setCredentials({ user: stored }));
      }
      try {
        const currentUser = await verifyAdminSession();
        if (active) {
          dispatch(setCredentials({ user: currentUser }));
          setChecking(false);
        }
      } catch {
        if (active) {
          clearAdminSession();
          clearAuthTokens();
          dispatch(logout());
          router.replace('/login?next=%2Fadmin-dashboard');
        }
      }
    };
    initAuth();
    return () => { active = false; };
  }, [dispatch, router]);

  if (checking || !isAuthenticated || user?.role !== 'admin') {
    return <LoadingSpinner variant="admin" message="Verifying access..." />;
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAdminSession();
    clearAuthTokens();
    dispatch(logout());
    router.replace('/login');
  };

  const navLabels: Record<string, string> = {
    '/admin-dashboard': 'Overview',
    '/admin-users':     'Users',
    '/admin-projects':  'Projects',
    '/admin-activity':  'Activity',
    '/admin-analytics': 'Analytics',
    '/admin-profile':   'Profile',
  };
  const pageName = navLabels[pathname] || 'Admin';

  return (
    <div className="admin-shell fixed inset-0 flex overflow-hidden">
      {/* Mobile top bar */}
      <div className="admin-mobile-bar md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-bold text-sm">Orbit Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5" aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="admin-main flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="admin-header relative z-30 mt-14 flex h-16 flex-shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:mt-0 md:px-8">
          <div className="items-center gap-2 text-sm hidden md:flex">
            <span className="text-gray-600">Admin</span>
            <span className="text-gray-700 mx-1">/</span>
            <span className="text-white font-medium">{pageName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 sm:flex">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]"></div>
              <span className="text-xs text-red-400 font-semibold">Admin Mode</span>
            </div>

            {/* Theme toggle */}
            <div className="ml-2">
              <ThemeToggle compact />
            </div>
          </div>
        </header>

        <main className="admin-content flex-1 overflow-auto p-4 sm:p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
