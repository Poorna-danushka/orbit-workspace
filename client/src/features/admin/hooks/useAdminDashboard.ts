'use client';

import { useCallback, useState, type FormEvent } from 'react';
import {
  getAdminActivity,
  getAdminStats,
  broadcastAdminMessage,
} from '@/features/admin/services/adminService';
import type { AdminActivityItem, AdminStats } from '@/features/admin/types';
import { getErrorMessage } from '@/lib/errors';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { AdminDashboardOverviewProps } from '@/features/admin/components/AdminDashboardOverview';

interface AdminDashboardResource {
  stats: AdminStats;
  activities: AdminActivityItem[];
}

export function useAdminDashboard(): AdminDashboardOverviewProps {
  const loadDashboard = useCallback(async (): Promise<AdminDashboardResource> => {
    const [statsResponse, activityResponse] = await Promise.all([
      getAdminStats(),
      getAdminActivity(),
    ]);
    return { stats: statsResponse.data, activities: activityResponse.data };
  }, []);
  const resource = useAsyncResource(loadDashboard);
  const [broadcast, setBroadcast] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [broadcastError, setBroadcastError] = useState('');
  const { stats, activities } = resource.data ?? { stats: null, activities: [] };

  const onBroadcastSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      void resource.reload();
    } catch (sendError: unknown) {
      setBroadcastError(getErrorMessage(sendError, 'Could not send the notification. Try again.'));
    } finally {
      setSending(false);
    }
  };

  return {
    stats,
    activities,
    loading: resource.loading,
    error: resource.error ? getErrorMessage(resource.error, 'Could not load the admin dashboard. Try again.') : '',
    broadcast,
    sending,
    broadcastStatus,
    broadcastError,
    completionRate: stats?.totalTasks
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0,
    recentUsers: stats?.recentUsers ?? [],
    onRefresh: () => void resource.reload(),
    onBroadcastChange: (value) => {
      setBroadcast(value);
      setBroadcastStatus('');
      setBroadcastError('');
    },
    onBroadcastSubmit,
  };
}
