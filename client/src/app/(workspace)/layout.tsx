'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import AuthGate from '@/features/auth/components/AuthGate';
import Sidebar from '@/components/layout/Sidebar';
import WorkspaceHeader from '@/components/layout/WorkspaceHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { reportError } from '@/lib/errors';
import { endSession } from '@/lib/auth/session';
import { logout } from '@/features/auth/services/authService';
import { acquireSocket, releaseSocket } from '@/lib/realtime/socket';
import { getUnreadNotificationCount } from '@/features/notifications/services/notificationService';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getWorkspacePageName } from '@/components/layout/workspaceNavigation';

function WorkspaceShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loadUnreadCount = useCallback(() => getUnreadNotificationCount(), []);
  const unreadResource = useAsyncResource(loadUnreadCount, {
    enabled: isAuthenticated && Boolean(user),
    initialData: 0,
  });
  const unreadCount = unreadResource.data ?? 0;
  const fetchUnreadCount = unreadResource.reload;

  useEffect(() => {
    if (unreadResource.error) reportError(unreadResource.error);
  }, [unreadResource.error]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const intervalId = window.setInterval(() => void fetchUnreadCount(), 30_000);
    return () => window.clearInterval(intervalId);
  }, [fetchUnreadCount, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const socket = acquireSocket();
    const onNotification = () => void fetchUnreadCount();
    socket.emit('joinUser', user.id);
    socket.on('notificationReceived', onNotification);
    return () => {
      socket.off('notificationReceived', onNotification);
      releaseSocket();
    };
  }, [fetchUnreadCount, isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: unknown) {
      reportError(error);
    } finally {
      endSession('logout');
    }
  };

  const pageName = getWorkspacePageName(pathname);

  if (!isAuthenticated || !user) {
    return <LoadingSpinner variant="workspace" message="Loading workspace..." />;
  }

  return (
    <div className="workspace-shell fixed inset-0 flex overflow-hidden">
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <WorkspaceHeader
          user={user}
          unreadCount={unreadCount}
          onMenuOpen={() => setSidebarOpen(true)}
          pageName={pageName}
        />
        <main className="flex-1 overflow-auto pt-14 md:pt-0">
          <div className="relative min-h-full p-4 sm:p-6 md:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.06),transparent_70%)]" />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <WorkspaceShell>{children}</WorkspaceShell>
    </AuthGate>
  );
}
