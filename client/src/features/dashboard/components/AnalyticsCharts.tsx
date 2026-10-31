'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import TaskStatusChart from '@/components/ui/TaskStatusChart';

type ValueDatum = { name: string; value: number };
type WeeklyDatum = { name: string; tasks: number; completed: number };

interface AnalyticsChartsProps {
  pieData: ValueDatum[];
  priorityBarData: ValueDatum[];
  weeklyData: WeeklyDatum[];
}

const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export default function AnalyticsCharts({
  pieData,
  priorityBarData,
  weeklyData,
}: AnalyticsChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131b] p-6 shadow-lg shadow-black/10">
          <h3 className="mb-6 text-base font-semibold">Task Status Breakdown</h3>
          <TaskStatusChart data={pieData} variant="workspace" />
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#11131b] p-6 shadow-lg shadow-black/10">
          <h3 className="mb-6 text-base font-semibold">Priority Distribution</h3>
          {priorityBarData.some((datum) => datum.value > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff50"
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#ffffff50"
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityBarData.map((_, index) => (
                    <Cell key={index} fill={PRIORITY_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-gray-600">
              No task data yet
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#11131b] p-6 shadow-lg shadow-black/10">
        <h3 className="mb-6 text-base font-semibold">Weekly Task Activity</h3>
        {weeklyData.length > 0 && weeklyData.some((day) => day.tasks > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#ffffff50"
                tick={{ fill: '#ffffff50', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#ffffff50"
                tick={{ fill: '#ffffff50', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="tasks"
                name="Tasks Due"
                stroke="#a855f7"
                strokeWidth={3}
                fill="url(#gradient)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#10b981"
                strokeWidth={3}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-gray-600">
            Add tasks with due dates to track weekly activity
          </div>
        )}
      </div>
    </>
  );
}
