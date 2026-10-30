import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatNumber } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminStats } from '@/features/admin/types';

export default function AdminPerformance({
  stats,
  loading,
  completionRate,
}: {
  stats: AdminStats | null;
  loading: boolean;
  completionRate: number;
}) {
  return (
    <section className="admin-overview-grid">
      <article className="admin-panel admin-growth-panel">
        <div className="admin-panel-heading">
          <div>
            <div className="admin-section-kicker">Growth</div>
            <h2>New accounts</h2>
            <p>Sign-ups per day over the past week</p>
          </div>
          <div className="admin-panel-icon">
            <Activity size={18} />
          </div>
        </div>
        {loading && !stats ? (
          <div className="admin-chart-placeholder">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : stats?.userGrowth?.length ? (
          <div className="admin-growth-chart" aria-label="New accounts per day">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={220}
              initialDimension={{ width: 400, height: 248 }}
            >
              <AreaChart
                data={stats.userGrowth}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="adminGrowthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--ob-primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--ob-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--ob-border)" strokeDasharray="4 5" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--ob-text-muted)', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--ob-text-muted)', fontSize: 11 }}
                  allowDecimals={false}
                  width={34}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--ob-surface)',
                    border: '1px solid var(--ob-border-2)',
                    borderRadius: 12,
                    color: 'var(--ob-text)',
                  }}
                  labelStyle={{ color: 'var(--ob-text-muted)' }}
                  itemStyle={{ color: 'var(--ob-primary)' }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="New accounts"
                  stroke="var(--ob-primary)"
                  strokeWidth={3}
                  fill="url(#adminGrowthFill)"
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="admin-empty-chart">There is no sign-up history to display yet.</div>
        )}
        <div className="admin-chart-footer">
          <span>
            <span className="admin-legend-dot" /> Daily sign-ups
          </span>
          <span>{formatNumber(stats?.newUsersToday)} today</span>
        </div>
      </article>
      <article className="admin-panel admin-workload-panel">
        <div className="admin-panel-heading">
          <div>
            <div className="admin-section-kicker">Workload</div>
            <h2>Task completion</h2>
            <p>Progress across all platform tasks</p>
          </div>
          <div className="admin-panel-icon">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="admin-completion">
          <div className="admin-completion-value">{stats ? `${completionRate}%` : '—'}</div>
          <div className="admin-completion-caption">completed</div>
          <div
            className="admin-completion-ring"
            style={{ '--completion': `${completionRate}%` } as CSSProperties}
          >
            <CheckCircle2 size={26} />
          </div>
        </div>
        <div
          className="admin-progress-track"
          role="progressbar"
          aria-label="Task completion"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${completionRate}%` }} />
        </div>
        <div className="admin-progress-labels">
          <span>{formatNumber(stats?.completedTasks)} complete</span>
          <span>{formatNumber(stats?.totalTasks)} total</span>
        </div>
        <div className="admin-workload-note">
          <Clock3 size={15} />
          <span>{formatNumber(stats?.overdueTasks)} tasks are overdue</span>
          <Link href={ROUTES.adminAnalytics} aria-label="View platform analytics">
            <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </section>
  );
}
