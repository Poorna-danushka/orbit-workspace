'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import { AxiosError } from 'axios';
import type { CSSProperties } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  broadcastMessage,
  getAdminActivity,
  getAdminStats,
  type AdminActivityItem,
  type AdminStats,
} from '@/lib/api/admin';

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as { message?: string } | undefined;
    return response?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function formatNumber(value: number | undefined): string {
  return typeof value === 'number' ? new Intl.NumberFormat().format(value) : '—';
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function initials(value: string): string {
  return value.trim().slice(0, 1).toUpperCase() || '?';
}

const metricCards: {
  label: string;
  key: 'totalUsers' | 'totalProjects' | 'totalTasks' | 'overdueTasks';
  noteKey?: 'newUsersToday' | 'completedTasks';
  note: string;
  icon: typeof Users;
  tone: 'violet' | 'cyan' | 'green' | 'amber';
}[] = [
  { label: 'Total users', key: 'totalUsers', noteKey: 'newUsersToday', note: 'new today', icon: Users, tone: 'violet' },
  { label: 'Projects', key: 'totalProjects', note: 'Across every workspace', icon: FolderKanban, tone: 'cyan' },
  { label: 'Tasks tracked', key: 'totalTasks', noteKey: 'completedTasks', note: 'completed', icon: CheckCircle2, tone: 'green' },
  { label: 'Overdue tasks', key: 'overdueTasks', note: 'Need attention', icon: AlertTriangle, tone: 'amber' },
] as const;

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
      setError(errorMessage(loadError, 'Could not load the admin dashboard. Try again.'));
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
      const response = await broadcastMessage(message);
      setBroadcast('');
      setBroadcastStatus(response.data.message);
      void loadDashboard();
    } catch (sendError: unknown) {
      setBroadcastError(errorMessage(sendError, 'Could not send the notification. Try again.'));
    } finally {
      setSending(false);
    }
  };

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const recentUsers = stats?.recentUsers ?? [];

  return (
    <div className="admin-overview">
      <header className="admin-overview-heading">
        <div>
          <div className="admin-eyebrow"><span className="admin-eyebrow-dot" /> Control room</div>
          <h1>Platform overview</h1>
          <p>A live snapshot of your people, projects, and work in Orbit.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="admin-action-button"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          {loading ? 'Updating' : 'Refresh data'}
        </button>
      </header>

      {error && (
        <div role="alert" className="admin-alert admin-alert-error">
          <div><AlertTriangle size={18} /><span>{error}</span></div>
          <button type="button" onClick={() => void loadDashboard()}>Retry</button>
        </div>
      )}

      <section className="admin-metric-grid" aria-label="Platform statistics">
        {metricCards.map(({ label, key, noteKey, note, icon: Icon, tone }) => {
          const value = stats?.[key];
          const detail = noteKey && stats
            ? `${formatNumber(stats[noteKey])} ${note}`
            : note;
          return (
            <article className={`admin-metric-card tone-${tone}`} key={key}>
              <div className="admin-metric-top">
                <span className="admin-metric-icon"><Icon size={18} /></span>
                {key === 'overdueTasks' && (value ?? 0) > 0
                  ? <span className="admin-metric-flag">Review</span>
                  : <span className="admin-metric-period">All time</span>}
              </div>
              <p className="admin-metric-label">{label}</p>
              <p className="admin-metric-value">
                {loading && !stats ? <span className="admin-skeleton" /> : formatNumber(value)}
              </p>
              <p className="admin-metric-note">{detail}</p>
            </article>
          );
        })}
      </section>

      <section className="admin-overview-grid">
        <article className="admin-panel admin-growth-panel">
          <div className="admin-panel-heading">
            <div>
              <div className="admin-section-kicker">Growth</div>
              <h2>New accounts</h2>
              <p>Sign-ups per day over the past week</p>
            </div>
            <div className="admin-panel-icon"><Activity size={18} /></div>
          </div>
          {loading && !stats ? (
            <div className="admin-chart-placeholder"><Loader2 className="animate-spin" size={24} /></div>
          ) : stats?.userGrowth?.length ? (
            <div className="admin-growth-chart" aria-label="New accounts per day">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} initialDimension={{ width: 400, height: 248 }}>
                <AreaChart data={stats.userGrowth} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
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
            <span><span className="admin-legend-dot" /> Daily sign-ups</span>
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
            <div className="admin-panel-icon"><CheckCircle2 size={18} /></div>
          </div>
          <div className="admin-completion">
            <div className="admin-completion-value">{stats ? `${completionRate}%` : '—'}</div>
            <div className="admin-completion-caption">completed</div>
            <div className="admin-completion-ring" style={{ '--completion': `${completionRate}%` } as CSSProperties}>
              <CheckCircle2 size={26} />
            </div>
          </div>
          <div className="admin-progress-track" role="progressbar" aria-label="Task completion" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${completionRate}%` }} />
          </div>
          <div className="admin-progress-labels">
            <span>{formatNumber(stats?.completedTasks)} complete</span>
            <span>{formatNumber(stats?.totalTasks)} total</span>
          </div>
          <div className="admin-workload-note">
            <Clock3 size={15} />
            <span>{formatNumber(stats?.overdueTasks)} tasks are overdue</span>
            <Link href="/admin-analytics" aria-label="View platform analytics"><ArrowRight size={15} /></Link>
          </div>
        </article>
      </section>

      <section className="admin-lower-grid">
        <article className="admin-panel admin-activity-panel">
          <div className="admin-panel-heading admin-panel-heading-inline">
            <div>
              <div className="admin-section-kicker">What’s happening</div>
              <h2>Recent activity</h2>
              <p>Latest events recorded across the platform</p>
            </div>
            <Link className="admin-text-link" href="/admin-activity">All activity <ArrowRight size={15} /></Link>
          </div>
          {activities.length ? (
            <ol className="admin-activity-list">
              {activities.slice(0, 5).map((item, index) => (
                <li key={`${item.type}-${item.time}-${index}`} className="admin-activity-item">
                  <span className={`admin-activity-marker marker-${item.type}`}><Activity size={15} /></span>
                  <span className="admin-activity-line" aria-hidden="true" />
                  <div className="admin-activity-copy">
                    <p>{item.label}</p>
                    <span>{item.user} <span aria-hidden="true">·</span> {formatDate(item.time)}</span>
                  </div>
                  {item.type.includes('register') && <ArrowUpRight className="admin-activity-trend" size={16} />}
                  {item.type.includes('notification') && <ArrowDownRight className="admin-activity-trend" size={16} />}
                </li>
              ))}
            </ol>
          ) : (
            <div className="admin-empty-state">
              <Activity size={20} />
              <span>{loading ? 'Loading platform activity…' : 'No recent platform activity.'}</span>
            </div>
          )}
        </article>

        <article className="admin-panel admin-users-panel">
          <div className="admin-panel-heading admin-panel-heading-inline">
            <div>
              <div className="admin-section-kicker">Community</div>
              <h2>Recently joined</h2>
              <p>Newest accounts on the platform</p>
            </div>
            <Link className="admin-icon-link" href="/admin-users" aria-label="Manage users"><ArrowRight size={17} /></Link>
          </div>
          <div className="admin-recent-users">
            {recentUsers.map((user, index) => (
              <div className="admin-recent-user" key={user.id}>
                <span className={`admin-user-initial initial-${index % 4}`}>{initials(user.username)}</span>
                <span className="admin-user-details">
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                </span>
                <span className={`admin-role-pill ${user.role === 'admin' ? 'role-admin' : ''}`}>{user.role}</span>
              </div>
            ))}
            {!recentUsers.length && (
              <div className="admin-empty-state">
                <Users size={20} />
                <span>{loading ? 'Loading accounts…' : 'No user accounts to display.'}</span>
              </div>
            )}
          </div>
          <Link href="/admin-users" className="admin-manage-users">Open user management <ArrowRight size={15} /></Link>
        </article>
      </section>

      <section className="admin-broadcast-panel">
        <div className="admin-broadcast-intro">
          <span className="admin-broadcast-icon"><Bell size={19} /></span>
          <div>
            <div className="admin-section-kicker">Platform communication</div>
            <h2>Send an announcement</h2>
            <p>Deliver a notification to every registered user.</p>
          </div>
        </div>
        <form onSubmit={handleBroadcast} className="admin-broadcast-form">
          <label className="sr-only" htmlFor="admin-broadcast-message">Announcement message</label>
          <textarea
            id="admin-broadcast-message"
            value={broadcast}
            onChange={(event) => {
              setBroadcast(event.target.value.slice(0, 500));
              setBroadcastStatus('');
              setBroadcastError('');
            }}
            placeholder="Share an important update with your users…"
            maxLength={500}
            rows={2}
          />
          <div className="admin-broadcast-controls">
            <span>{broadcast.length}/500 characters</span>
            <button type="submit" disabled={!broadcast.trim() || sending}>
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {sending ? 'Sending…' : 'Send announcement'}
            </button>
          </div>
          {broadcastStatus && <p className="admin-form-feedback feedback-success" role="status">{broadcastStatus}</p>}
          {broadcastError && <p className="admin-form-feedback feedback-error" role="alert">{broadcastError}</p>}
        </form>
      </section>

      {loading && stats && (
        <p className="admin-refresh-note" role="status"><Loader2 size={14} className="animate-spin" /> Refreshing live data…</p>
      )}
    </div>
  );
}
