'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { getStoredUser, clearAuthTokens } from '@/lib/tokenStorage';
import { RootState } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import api from '@/lib/axios';
import { BACKEND_URL } from '@/lib/config';
import Sidebar from '@/components/layout/Sidebar';
import WorkspaceHeader from '@/components/layout/WorkspaceHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const navItems = [
  { name: 'Dashboard',     href: '/dashboard',      exact: true  },
  { name: 'Projects',      href: '/projects',        exact: false },
  { name: 'My Tasks',      href: '/tasks',           exact: true  },
  { name: 'Analytics',     href: '/analytics',       exact: true  },
  { name: 'Notifications', href: '/notifications',   exact: true  },
  { name: 'Profile',       href: '/profile',         exact: true  },
  { name: 'Admin Console', href: '/admin',            exact: false },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hydrated, setHydrated]       = useState(false);

  /* Auth rehydration */
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser && !isAuthenticated) {
        dispatch(setCredentials({ user: storedUser }));
      }
      try {
        const res = await api.get('/user/me');
        const currentUser = res.data?.user || res.data;
        if (currentUser) dispatch(setCredentials({ user: currentUser }));
      } catch {
        if (!storedUser) {
          dispatch(logout());
          router.replace('/login');
        }
      } finally {
        setHydrated(true);
      }
    };
    initAuth();
  }, [dispatch, router]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  /* Notifications polling */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setUnreadCount((res.data as {isRead:boolean}[]).filter(n => !n.isRead).length);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const t = window.setTimeout(fetchUnreadCount, 0);
    const i = window.setInterval(fetchUnreadCount, 30_000);
    return () => { window.clearTimeout(t); window.clearInterval(i); };
  }, [isAuthenticated, fetchUnreadCount]);

  /* Real-time notifications socket */
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const socket = io(BACKEND_URL);
    socket.emit('joinUser', user.id);
    socket.on('notificationReceived', () => { fetchUnreadCount(); });
    return () => { socket.disconnect(); };
  }, [isAuthenticated, user, fetchUnreadCount]);

  /* Close sidebar on route change */
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!hydrated || !isAuthenticated) {
    return <LoadingSpinner variant="workspace" message="Loading workspace…" />;
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuthTokens();
    dispatch(logout());
    router.replace('/login');
  };

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const pageName =
    navItems.find(n => isActive(n))?.name ??
    (pathname.includes('/projects/') ? 'Kanban Board' : 'Dashboard');

  return (
    <div className="fixed inset-0 bg-[#08090d] text-white flex overflow-hidden">
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <WorkspaceHeader
          user={user}
          unreadCount={unreadCount}
          onMenuOpen={() => setSidebarOpen(true)}
          pageName={pageName}
        />

        <main className="flex-1 overflow-auto pt-14 md:pt-0">
          <div className="relative min-h-full p-4 sm:p-6 md:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48
                            bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.06),transparent_70%)]" />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
