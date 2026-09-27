'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, Menu, X } from 'lucide-react';
import { RootState } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import { getStoredUser } from '@/lib/tokenStorage';
import api from '@/lib/axios';
import { clearAuthTokens } from '@/lib/tokenStorage';
import AdminSidebar from '@/components/layout/AdminSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredUser();
      if (stored && stored.role === 'admin') {
        dispatch(setCredentials({ user: stored }));
      }
      try {
        const res = await api.get('/user/me');
        const currentUser = res.data?.user || res.data;
        if (currentUser && currentUser.role === 'admin') {
          dispatch(setCredentials({ user: currentUser }));
          setChecking(false);
        } else {
          dispatch(logout());
          router.replace('/login');
        }
      } catch {
        if (!stored || stored.role !== 'admin') {
          dispatch(logout());
          router.replace('/login');
        } else {
          setChecking(false);
        }
      }
    };
    initAuth();
  }, [dispatch, router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (checking && (!isAuthenticated || user?.role !== 'admin')) {
    return <LoadingSpinner variant="admin" message="Verifying access..." />;
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuthTokens();
    dispatch(logout());
    router.replace('/login');
  };

  const navLabels: Record<string, string> = {
    '/admin': 'Overview',
    '/admin/users': 'Users',
    '/admin/projects': 'Projects',
    '/admin/activity': 'Activity',
    '/admin/analytics': 'Analytics',
    '/admin/profile': 'Profile',
  };
  const pageName = navLabels[pathname] || 'Admin';

  return (
    <div className="fixed inset-0 bg-[#08090d] text-white flex overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#080a0f]/90 backdrop-blur-md border-b border-white/[0.06] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 md:px-8 border-b border-white/[0.08] bg-[#101218]/85 backdrop-blur-md mt-14 md:mt-0 relative z-30">
          <div className="items-center gap-2 text-sm hidden md:flex">
            <span className="text-gray-600">Admin</span>
            <span className="text-gray-700 mx-1">/</span>
            <span className="text-white font-medium">{pageName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]"></div>
              <span className="text-xs text-red-400 font-semibold">Admin Mode</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
