'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FolderKanban, Activity, BarChart2,
  LogOut, Shield, User, X
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';

const navItems = [
  { name: 'Overview',  href: '/admin',           icon: LayoutDashboard },
  { name: 'Users',     href: '/admin/users',      icon: Users },
  { name: 'Projects',  href: '/admin/projects',   icon: FolderKanban },
  { name: 'Activity',  href: '/admin/activity',   icon: Activity },
  { name: 'Analytics', href: '/admin/analytics',  icon: BarChart2 },
  { name: 'Profile',   href: '/admin/profile',    icon: User },
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
    <aside className={`absolute md:static inset-y-0 left-0 z-40 w-64 bg-[#101218] border-r border-white/[0.08] flex flex-col transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    } h-full flex-shrink-0`}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.35)]">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white leading-none">Admin Panel</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Orbit</p>
        </div>
        <button className="md:hidden p-1 text-gray-500 hover:text-white" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest px-3 mb-3">Management</p>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-red-500/15 to-orange-500/5 text-white border border-red-500/20'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/[0.06]">
        <Link
          href="/admin/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-2 py-2 mb-3 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer"
        >
          <Avatar user={user} size="sm" className="shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:scale-105 transition-transform" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate leading-none text-white group-hover:text-red-400 transition-colors">{user?.username}</p>
            <p className="text-[11px] text-gray-600 truncate mt-0.5">{user?.email}</p>
          </div>
          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">ADMIN</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
