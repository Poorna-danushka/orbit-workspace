'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  getAdminActivity,
  getAdminStats,
  broadcastAdminMessage,
} from '@/features/admin/services/adminService';
import type { AdminActivityItem, AdminStats } from '@/features/admin/types';
import { getErrorMessage } from '@/lib/errors';
import AdminDashboardOverview from './AdminDashboardOverview';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [broadcast, setBroadcast] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [broadcastError, setBroadcastError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        getAdminStats(),
        getAdminActivity(),
      ]);
      setStats(statsResponse.data);
      setActivities(activityResponse.data);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Could not load the admin dashboard. Try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboard(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const handleBroadcast = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = broadcast.trim();
    if (!message || sending) return;

    setSending(true);
    setBroadcastStatus('');
    setBroadcastError('');
    try {
      const response = await broadcastAdminMessage(message);
      setBroadcast('');
      setBroadcastStatus(response.data.message);
      void loadDashboard();
    } catch (sendError: unknown) {
      setBroadcastError(getErrorMessage(sendError, 'Could not send the notification. Try again.'));
    } finally {
      setSending(false);
    }
  };

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <AdminDashboardOverview
      stats={stats}
      activities={activities}
      loading={loading}
      error={error}
      broadcast={broadcast}
      sending={sending}
      broadcastStatus={broadcastStatus}
      broadcastError={broadcastError}
      completionRate={completionRate}
      recentUsers={stats?.recentUsers ?? []}
      onRefresh={() => void loadDashboard()}
      onBroadcastChange={(value) => {
        setBroadcast(value);
        setBroadcastStatus('');
        setBroadcastError('');
      }}
      onBroadcastSubmit={handleBroadcast}
    />
  );
}
