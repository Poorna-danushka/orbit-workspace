'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, CheckSquare, LogOut,
  Layers, Bell, X, BarChart2, User, ChevronRight, Shield
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';

import OrbitIcon from '@/components/auth/OrbitIcon';

const navItems = [
  { name: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard, exact: true  },
  { name: 'Projects',      href: '/projects',        icon: FolderKanban,    exact: false },
  { name: 'My Tasks',      href: '/tasks',           icon: CheckSquare,     exact: true  },
  { name: 'Analytics',     href: '/analytics',       icon: BarChart2,       exact: true  },
  { name: 'Notifications', href: '/notifications',   icon: Bell,            exact: true  },
  { name: 'Profile',       href: '/profile',         icon: User,            exact: true  },
];

interface SidebarUser {
  id?: string;
  username: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

interface SidebarProps {
  user: SidebarUser | null;
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onLogout: () => void;
}

export default function Sidebar({ user, isOpen, onClose, unreadCount, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const adminLink = user?.role === 'admin'
    ? [{ name: 'Admin Console', href: '/admin', icon: Shield, exact: false }]
    : [];
  const allNavItems = [...navItems, ...adminLink];

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-50 md:z-auto
      w-60 flex flex-col flex-shrink-0
      bg-[#0d0f16] border-r border-white/[0.08]
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="h-[60px] flex items-center gap-2.5 px-5 border-b border-white/[0.07] flex-shrink-0">
        <OrbitIcon size={28} className="flex-shrink-0" />
        <span className="font-bold text-sm bg-clip-text text-transparent
                         bg-gradient-to-r from-purple-400 to-blue-400 flex-1">
          Orbit
        </span>
        <button
          className="md:hidden p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest px-2 mb-3">
          Workspace
        </p>

        {allNavItems.map(item => {
          const active = isActive(item);
          const isAdmin = item.name === 'Admin Console';
          const Icon = item.icon;
          const activeColor = isAdmin ? 'text-orange-400' : 'text-purple-400';
          const activeBg = isAdmin ? 'bg-orange-500/10' : 'bg-purple-500/10';

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150 group relative
                ${active
                  ? `${activeBg} ${activeColor}`
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'}
              `}
            >
              {active && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full
                  ${isAdmin ? 'bg-orange-400' : 'bg-purple-400'}`} />
              )}

              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors
                ${active ? activeColor : 'text-gray-600 group-hover:text-gray-400'}`} />

              <span className="flex-1 truncate">{item.name}</span>

              {item.name === 'Notifications' && unreadCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white rounded-full
                                 px-1.5 py-0.5 font-bold min-w-[18px] text-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.07] p-3 flex-shrink-0">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-2 py-2 rounded-xl
                     hover:bg-white/[0.05] transition-colors group"
        >
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user?.username}
            </p>
            <p className="text-[11px] text-gray-600 truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
        </Link>

        <button
          onClick={onLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                     text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
