'use client';

import { useCallback, useState, useEffect } from 'react';
import { reportError } from '@/lib/errors';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/services/notificationService';
import type { NotificationItem } from '@/features/notifications/types';
import { Bell, CheckCheck, Loader2, RefreshCw } from 'lucide-react';
import NotificationCard from './NotificationCard';

type FilterType = 'all' | 'unread' | 'read';

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifications(await getNotifications());
    } catch (err) {
      reportError(err, 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchNotifications());
  }, [fetchNotifications]);

  const refreshNotifications = () => {
    setLoading(true);
    void fetchNotifications();
  };

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      reportError(err, 'Failed to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      reportError(err, 'Failed to update notifications');
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const FILTERS: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'all', count: notifications.length },
    { label: 'Unread', value: 'unread', count: unread },
    { label: 'Read', value: 'read', count: notifications.length - unread },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-gray-400 text-sm mt-1">
            {loading
              ? 'Loading...'
              : unread > 0
                ? `${unread} unread notification${unread > 1 ? 's' : ''}`
                : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={refreshNotifications}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-white/5 rounded-xl border border-white/10 hover:bg-white/8"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-full sm:w-fit border border-white/5 overflow-x-auto scrollbar-none flex-nowrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
              filter === f.value
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md ${filter === f.value ? 'bg-purple-500/20' : 'bg-white/5'}`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-gray-600 text-sm">
            {filter === 'unread'
              ? "You're all caught up!"
              : 'Notifications will appear here when tasks are assigned or deadlines approach.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => void markRead(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
