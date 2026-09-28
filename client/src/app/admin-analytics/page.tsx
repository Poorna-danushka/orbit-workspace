'use client';

import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CheckCircle2, FolderKanban, Loader2, RefreshCw, Users } from 'lucide-react';
import api from '@/lib/axios';
import type { AdminStats } from '@/lib/api/admin';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<AdminStats>('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
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

  const productivity = stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const taskStatusData = [
    { name: 'Completed', value: stats?.completedTasks ?? 0 },
    { name: 'Overdue', value: stats?.overdueTasks ?? 0 },
    { name: 'Active', value: Math.max(0, (stats?.totalTasks ?? 0) - (stats?.completedTasks ?? 0) - (stats?.overdueTasks ?? 0)) },
  ].filter((item) => item.value > 0);
  const userGrowthData = stats?.userGrowth ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Monitoring growth, tasks, and operational health</p>
        </div>
        <button onClick={refreshStats} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, tone: 'text-blue-400', delta: `+${stats?.newUsersToday ?? 0} today` },
          { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: FolderKanban, tone: 'text-violet-400', delta: 'across platform' },
          { label: 'Tasks Completed', value: stats?.completedTasks ?? 0, icon: CheckCircle2, tone: 'text-emerald-400', delta: `${productivity}% completion rate` },
          { label: 'Overdue Tasks', value: stats?.overdueTasks ?? 0, icon: AlertTriangle, tone: 'text-red-400', delta: 'need attention' },
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

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-[#11131b] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">User growth</h2>
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="adminUserGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff20" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={2.5} fill="url(#adminUserGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">No user growth data yet.</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#11131b] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Task status</h2>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">No task data yet.</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#11131b] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Productivity overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
              <span>Completion rate</span>
              <span>{productivity}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${productivity}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
              <span>New users today</span>
              <span>{stats?.newUsersToday ?? 0}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min((stats?.newUsersToday ?? 0) * 20, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-gray-500">Weekly volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff20" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#ffffff20" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="users" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
