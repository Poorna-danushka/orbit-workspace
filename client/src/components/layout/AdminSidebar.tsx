'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderKanban, Activity, BarChart2, LogOut, Shield, User, X } from 'lucide-react';
import Avatar from '@/components/common/Avatar';

const navItems = [
  { name: 'Overview',  href: '/admin-dashboard', icon: LayoutDashboard },
  { name: 'Users',     href: '/admin-users',     icon: Users },
  { name: 'Projects',  href: '/admin-projects',  icon: FolderKanban },
  { name: 'Activity',  href: '/admin-activity',  icon: Activity },
  { name: 'Analytics', href: '/admin-analytics', icon: BarChart2 },
  { name: 'Profile',   href: '/admin-profile',   icon: User },
];

interface AdminSidebarUser {
  id?: string;
  username: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

interface AdminSidebarProps {
  user: AdminSidebarUser | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({ user, isOpen, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Admin navigation"
      style={{ display: isOpen ? 'flex' : 'none' }}
      className="admin-sidebar absolute inset-y-0 left-0 z-40 flex h-full w-[min(18rem,85vw)] flex-shrink-0 flex-col border-r transition-transform duration-300 md:static md:w-64"
    >
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-none">Orbit Admin</p>
          <p className="mt-1 text-[10px] text-[var(--ob-text-muted)]">Workspace control</p>
        </div>
        <button className="rounded-md p-1 text-[var(--ob-text-muted)] hover:bg-black/5 hover:text-[var(--ob-text)] md:hidden" onClick={onClose} aria-label="Close admin menu">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--ob-text-faint)]">Management</p>
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? 'admin-nav-active'
                  : 'admin-nav-link'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-red-500' : 'text-[var(--ob-text-muted)]'}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <Link
          href="/admin-profile"
          onClick={onClose}
          className="group mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-black/5"
        >
          <Avatar user={user} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-none">{user?.username}</p>
            <p className="mt-1 truncate text-[11px] text-[var(--ob-text-muted)]">{user?.email}</p>
          </div>
          <span className="flex-shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">ADMIN</span>
        </Link>
        <button
          onClick={onLogout}
          className="admin-logout-button group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
