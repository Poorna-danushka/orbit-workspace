'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminStats } from '@/features/admin/types';
import TaskStatusChart from '@/components/ui/TaskStatusChart';

type UserGrowthEntry = AdminStats['userGrowth'][number];
type TaskStatusEntry = { name: string; value: number };

interface AdminAnalyticsPanelsProps {
  userGrowthData: UserGrowthEntry[];
  taskStatusData: TaskStatusEntry[];
  productivity: number;
  newUsersToday: number;
}

export default function AdminAnalyticsPanels({
  userGrowthData,
  taskStatusData,
  productivity,
  newUsersToday,
}: AdminAnalyticsPanelsProps) {
  return (
    <>
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
                <XAxis
                  dataKey="name"
                  stroke="#ffffff20"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#ffffff20"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d0f14',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#adminUserGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">
              No user growth data yet.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#11131b] p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Task status</h2>
          <TaskStatusChart data={taskStatusData} variant="admin" />
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
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                style={{ width: `${productivity}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
              <span>New users today</span>
              <span>{newUsersToday}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(newUsersToday * 20, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-gray-500">
            Weekly volume
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#ffffff20"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#ffffff20"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d0f14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="users" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
