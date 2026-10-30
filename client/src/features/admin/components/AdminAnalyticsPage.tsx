'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FolderKanban, Loader2, RefreshCw, Users } from 'lucide-react';
import { reportError } from '@/lib/errors';
import { getAdminStats } from '@/features/admin/services/adminService';
import type { AdminStats } from '@/features/admin/types';
import AdminAnalyticsPanels from './AdminAnalyticsPanels';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (error) {
      reportError(error, 'Failed to fetch admin analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchStats());
  }, [fetchStats]);

  const refreshStats = () => {
    setLoading(true);
    void fetchStats();
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  const productivity = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const taskStatusData = [
    { name: 'Completed', value: stats?.completedTasks ?? 0 },
    { name: 'Overdue', value: stats?.overdueTasks ?? 0 },
    {
      name: 'Active',
      value: Math.max(
        0,
        (stats?.totalTasks ?? 0) - (stats?.completedTasks ?? 0) - (stats?.overdueTasks ?? 0),
      ),
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoring growth, tasks, and operational health
          </p>
        </div>
        <button
          onClick={refreshStats}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Users',
            value: stats?.totalUsers ?? 0,
            icon: Users,
            tone: 'text-blue-400',
            delta: `+${stats?.newUsersToday ?? 0} today`,
          },
          {
            label: 'Total Projects',
            value: stats?.totalProjects ?? 0,
            icon: FolderKanban,
            tone: 'text-violet-400',
            delta: 'across platform',
          },
          {
            label: 'Tasks Completed',
            value: stats?.completedTasks ?? 0,
            icon: CheckCircle2,
            tone: 'text-emerald-400',
            delta: `${productivity}% completion rate`,
          },
          {
            label: 'Overdue Tasks',
            value: stats?.overdueTasks ?? 0,
            icon: AlertTriangle,
            tone: 'text-red-400',
            delta: 'need attention',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[#11131b] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.label}</span>
                <Icon className={`h-5 w-5 ${item.tone}`} />
              </div>
              <div className="text-3xl font-bold text-white">{item.value}</div>
              <div className="mt-2 text-xs text-gray-500">{item.delta}</div>
            </div>
          );
        })}
      </div>

      <AdminAnalyticsPanels
        userGrowthData={stats?.userGrowth ?? []}
        taskStatusData={taskStatusData}
        productivity={productivity}
        newUsersToday={stats?.newUsersToday ?? 0}
      />
    </div>
  );
}
