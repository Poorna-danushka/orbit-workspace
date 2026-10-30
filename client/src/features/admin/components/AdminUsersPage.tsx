'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  Calendar,
  Loader2,
  RefreshCw,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { getAvatarUrl } from '@/lib/utils/avatar';
import { getErrorMessage } from '@/lib/errors';
import {
  changeAdminRole,
  deleteAdminUser,
  getAdminUsers,
} from '@/features/admin/services/adminService';
import type { AdminUser } from '@/features/admin/types';
import AdminMetricCard from './AdminMetricCard';
import AdminUserDeleteConfirmation from './AdminUserDeleteConfirmation';
import AdminSearchInput from './AdminSearchInput';

export default function AdminUsersPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAdminUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error: unknown) {
      setActionError(getErrorMessage(error, 'Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchUsers());
  }, [fetchUsers]);

  const refreshUsers = () => {
    setLoading(true);
    void fetchUsers();
  };

  const handleDelete = async (user: AdminUser) => {
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setConfirmDelete(null);
    } catch (error: unknown) {
      setActionError(getErrorMessage(error, 'Failed to delete user'));
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await changeAdminRole(user.id, nextRole);
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, role: nextRole } : item)),
      );
    } catch (error: unknown) {
      setActionError(getErrorMessage(error, 'Failed to update role'));
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const regularCount = users.filter((user) => user.role === 'user').length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const newUsersToday = users.filter((user) => new Date(user.createdAt) >= todayStart).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage platform access and permissions</p>
        </div>
        <button
          onClick={refreshUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {actionError}
          </div>
          <button onClick={() => setActionError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total accounts', value: totalUsers, icon: Users, tone: 'text-blue-400' },
          { label: 'Admins', value: adminCount, icon: Shield, tone: 'text-red-400' },
          { label: 'Regular users', value: regularCount, icon: User, tone: 'text-violet-400' },
          { label: 'New today', value: newUsersToday, icon: Calendar, tone: 'text-emerald-400' },
        ].map((item) => (
          <AdminMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {['all', 'admin', 'user'].map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab as 'all' | 'admin' | 'user')}
              className={`rounded-lg px-3 py-2 text-sm ${roleFilter === tab ? 'bg-red-500/15 text-red-400' : 'text-gray-400'}`}
            >
              {tab === 'all' ? 'All Users' : tab === 'admin' ? 'Administrators' : 'Regular Users'}
            </button>
          ))}
        </div>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by username or email..."
        />
      </div>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-400" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#11131b] p-10 text-center text-gray-500">
          No users found for the current filters.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-2xl border border-white/10 bg-[#11131b] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <Image
                      src={getAvatarUrl(user.avatar)}
                      alt={user.username}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-red-500 to-orange-400 text-sm font-bold text-white">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${user.role === 'admin' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-blue-500/20 bg-blue-500/10 text-blue-400'}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-xs text-gray-500">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRole(user)}
                    disabled={currentUser?.id === user.id}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(user)}
                    disabled={currentUser?.id === user.id}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <AdminUserDeleteConfirmation
          user={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => void handleDelete(confirmDelete)}
        />
      )}
    </div>
  );
}
