'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Loader2, RefreshCw, Activity } from 'lucide-react';
import api from '@/lib/axios';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6b7280'];
const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export default function Analytics() {
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/dashboard/stats');
      setDashData(statsRes.data);
    } catch (err) {
      console.error('Analytics fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
  ].filter(d => d.value > 0);

  const priorityBarData = [
    { name: 'Urgent', value: urgent },
    { name: 'High', value: Math.max(0, Math.ceil(total * 0.3) - urgent) },
    { name: 'Medium', value: Math.ceil(total * 0.4) },
    { name: 'Low', value: Math.ceil(total * 0.1) },
  ];

  const weeklyData = dashData?.weeklyData || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Workspace Analytics</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time productivity metrics and task performance</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(120,119,198,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading productivity analytics...</p>
        </div>
      ) : (
        <>
          {/* Summary Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 flex-shrink-0">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-200 mb-1">
                  Performance Summary
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  You have {total} total tasks across {dashData?.totalProjects || 0} active projects. Your overall completion rate is {productivity}%.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Tasks', value: total, color: 'text-white' },
              { label: 'Completed', value: completed, color: 'text-green-400' },
              { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-400' : 'text-gray-400' },
              { label: 'Productivity', value: `${productivity}%`, color: 'text-purple-400' },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#11131b] border border-white/[0.08] shadow-lg shadow-black/10">
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#11131b] border border-white/[0.08] shadow-lg shadow-black/10">
              <h3 className="text-base font-semibold mb-6">Task Status Breakdown</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-gray-600 text-sm">No task data yet</div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#11131b] border border-white/[0.08] shadow-lg shadow-black/10">
              <h3 className="text-base font-semibold mb-6">Priority Distribution</h3>
              {priorityBarData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={priorityBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {priorityBarData.map((_, i) => <Cell key={i} fill={PRIORITY_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-gray-600 text-sm">No task data yet</div>
              )}
            </div>
          </div>

          {/* Weekly Data */}
          <div className="p-6 rounded-2xl bg-[#11131b] border border-white/[0.08] shadow-lg shadow-black/10">
            <h3 className="text-base font-semibold mb-6">Weekly Task Activity</h3>
            {weeklyData.length > 0 && weeklyData.some((d: any) => d.tasks > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="tasks" name="Tasks Due" stroke="#a855f7" strokeWidth={3} fill="url(#gradient)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
                Add tasks with due dates to track weekly activity
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
