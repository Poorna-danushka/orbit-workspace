'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import { reportError } from '@/lib/errors';
import { getDashboardStats } from '@/features/dashboard/services/dashboardService';
import type { DashboardStats } from '@/features/dashboard/types';
import AnalyticsCharts from './AnalyticsCharts';

export default function Analytics() {
  const [dashData, setDashData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const statsRes = await getDashboardStats();
      setDashData(statsRes.data);
    } catch (error) {
      reportError(error, 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchAnalytics());
  }, [fetchAnalytics]);

  const refreshAnalytics = () => {
    setLoading(true);
    void fetchAnalytics();
  };

  const total = dashData?.totalTasks || 0;
  const completed = dashData?.completedTasks || 0;
  const inProgress = dashData?.inProgressTasks || 0;
  const pending = dashData?.pendingTasks || 0;
  const urgent = dashData?.urgentTasks || 0;
  const overdue = dashData?.overdueTasks || 0;
  const productivity = dashData?.productivity || 0;

  const pieData = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Todo', value: pending },
  ].filter((datum) => datum.value > 0);

  const priorityBarData = [
    { name: 'Urgent', value: urgent },
    { name: 'High', value: Math.max(0, Math.ceil(total * 0.3) - urgent) },
    { name: 'Medium', value: Math.ceil(total * 0.4) },
    { name: 'Low', value: Math.ceil(total * 0.1) },
  ];

  const weeklyData = dashData?.weeklyData || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Workspace Analytics</h2>
          <p className="mt-1 text-sm text-gray-400">
            Real-time productivity metrics and task performance
          </p>
        </div>
        <button
          onClick={refreshAnalytics}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_15px_rgba(120,119,198,0.3)] transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading productivity analytics...</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-6 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-xl bg-purple-500/20 p-3">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-purple-200">Performance Summary</h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  You have {total} total tasks across {dashData?.totalProjects || 0} active
                  projects. Your overall completion rate is {productivity}%.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Total Tasks', value: total, color: 'text-white' },
              { label: 'Completed', value: completed, color: 'text-green-400' },
              {
                label: 'Overdue',
                value: overdue,
                color: overdue > 0 ? 'text-red-400' : 'text-gray-400',
              },
              { label: 'Productivity', value: `${productivity}%`, color: 'text-purple-400' },
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/[0.08] bg-[#11131b] p-5 shadow-lg shadow-black/10"
              >
                <p className="mb-1 text-xs text-gray-400">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <AnalyticsCharts
            pieData={pieData}
            priorityBarData={priorityBarData}
            weeklyData={weeklyData}
          />
        </>
      )}
    </div>
  );
}
