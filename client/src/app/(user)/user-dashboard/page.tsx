'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { AxiosError } from 'axios';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/lib/axios';
import { getDashboardStats, type DashboardStats } from '@/lib/api/user';

interface ProjectOption {
  id: string;
  title: string;
}

type ProjectResponse = ProjectOption[] | { data?: ProjectOption[] };

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as { message?: string } | undefined;
    return response?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

const priorityClass: Record<string, string> = {
  Urgent: 'priority-urgent',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickForm, setQuickForm] = useState({ title: '', projectId: '', priority: 'Medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, projectsResponse] = await Promise.all([
        getDashboardStats(),
        api.get<ProjectResponse>('/projects?page=1&limit=50'),
      ]);
      setStats(statsResponse.data);
      const projectData = projectsResponse.data;
      setProjects(Array.isArray(projectData) ? projectData : projectData.data ?? []);
    } catch (loadError: unknown) {
      setError(errorMessage(loadError, 'Could not load your workspace overview.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboard(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const handleQuickAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickForm.title.trim() || !quickForm.projectId || submitting) return;

    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/tasks', {
        title: quickForm.title.trim(),
        projectId: quickForm.projectId,
        priority: quickForm.priority,
        dueDate: quickForm.dueDate || null,
        status: 'Todo',
      });
      setQuickForm({ title: '', projectId: quickForm.projectId, priority: 'Medium', dueDate: '' });
      setShowQuickAdd(false);
      await loadDashboard();
    } catch (submitError: unknown) {
      setFormError(errorMessage(submitError, 'Could not create the task.'));
    } finally {
      setSubmitting(false);
    }
  };

  const cards = [
    { label: 'All tasks', value: stats?.totalTasks, icon: Target, tone: 'violet' },
    { label: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, tone: 'green' },
    { label: 'In progress', value: stats?.inProgressTasks, icon: Clock3, tone: 'cyan' },
    { label: 'Productivity', value: stats ? `${stats.productivity}%` : '—', icon: Activity, tone: 'amber' },
  ];

  return (
    <div className="member-dashboard">
      {(stats?.overdueTasks ?? 0) > 0 && (
        <div className="member-overdue-banner">
          <span className="member-overdue-icon"><AlertTriangle size={18} /></span>
          <p><strong>{stats?.overdueTasks} overdue task{stats?.overdueTasks === 1 ? '' : 's'}</strong><span>Review what needs your attention.</span></p>
          <Link href="/tasks">Open tasks <ArrowRight size={15} /></Link>
        </div>
      )}

      <header className="member-dashboard-heading">
        <div>
          <span className="member-dashboard-kicker">Your workspace</span>
          <h1>Welcome back, {user?.username || 'there'}.</h1>
          <p>Here’s what’s moving across your projects today.</p>
        </div>
        <div className="member-dashboard-actions">
          <button type="button" className="member-refresh-button" onClick={() => void loadDashboard()} disabled={loading} aria-label="Refresh dashboard">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button type="button" className="member-primary-button" onClick={() => { setFormError(''); setShowQuickAdd(true); }}>
            <Plus size={17} /> New task
          </button>
        </div>
      </header>

      {error && (
        <div className="member-dashboard-error" role="alert">
          <AlertTriangle size={17} /><span>{error}</span>
          <button type="button" onClick={() => void loadDashboard()}>Try again</button>
        </div>
      )}

      <section className="member-stat-grid" aria-label="Your task summary">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article className={`member-stat-card stat-${tone}`} key={label}>
            <div className="member-stat-top">
              <span className="member-stat-icon"><Icon size={18} /></span>
              <span className="member-stat-label">{label}</span>
            </div>
            <strong>{loading && !stats ? <span className="member-stat-skeleton" /> : value ?? 0}</strong>
            <span className="member-stat-note">
              {label === 'All tasks' ? `${stats?.pendingTasks ?? 0} waiting` : label === 'Completed' ? `${stats?.totalProjects ?? 0} projects in your workspace` : label === 'In progress' ? `${stats?.urgentTasks ?? 0} marked urgent` : 'Based on completed tasks'}
            </span>
          </article>
        ))}
      </section>

      <section className="member-dashboard-main-grid">
        <article className="member-dashboard-panel member-weekly-panel">
          <div className="member-panel-heading">
            <div>
              <span className="member-panel-kicker">Your workload</span>
              <h2>Task due-date trend</h2>
              <p>Tasks with due dates during the past seven days</p>
            </div>
            <span className="member-panel-icon"><CalendarDays size={18} /></span>
          </div>
          {stats?.weeklyData?.length ? (
            <div className="member-weekly-chart" aria-label="Tasks due by day this week">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={210} initialDimension={{ width: 320, height: 235 }}>
                <AreaChart data={stats.weeklyData} margin={{ top: 14, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memberTasksFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--ob-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--ob-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--ob-border)" strokeDasharray="4 5" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--ob-text-muted)', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ob-text-muted)', fontSize: 11 }} allowDecimals={false} width={34} />
                  <Tooltip
                    contentStyle={{ background: 'var(--ob-surface)', border: '1px solid var(--ob-border-2)', borderRadius: 12, color: 'var(--ob-text)' }}
                    labelStyle={{ color: 'var(--ob-text-muted)' }}
                  />
                  <Area type="monotone" dataKey="tasks" name="Tasks due" stroke="var(--ob-primary)" strokeWidth={3} fill="url(#memberTasksFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="member-dashboard-empty-chart">
              <Activity size={22} />
              <span>{loading ? 'Loading your schedule…' : 'No due-date activity to display yet.'}</span>
            </div>
          )}
          <div className="member-chart-footer">
            <span><i /> Tasks due</span>
            <span>{stats?.totalTasks ?? 0} total tasks</span>
          </div>
        </article>

        <article className="member-dashboard-panel member-deadlines-panel">
          <div className="member-panel-heading">
            <div>
              <span className="member-panel-kicker">Stay ahead</span>
              <h2>Upcoming deadlines</h2>
              <p>Next tasks due in your projects</p>
            </div>
            <span className="member-panel-icon deadline-icon"><Clock3 size={18} /></span>
          </div>
          <div className="member-deadline-list">
            {stats?.upcomingDeadlines?.length ? stats.upcomingDeadlines.map((task) => (
              <Link className="member-deadline-item" href={`/projects/${task.projectId}`} key={task.id}>
                <span className="member-deadline-date">{formatDate(task.dueDate)}</span>
                <span className="member-deadline-title">{task.title}</span>
                <span className="member-deadline-meta">
                  <span>{task.project?.title || 'Project'}</span>
                  <span className={`member-priority-pill ${priorityClass[task.priority] ?? ''}`}>{task.priority}</span>
                </span>
                <ArrowRight size={15} className="member-deadline-arrow" />
              </Link>
            )) : (
              <div className="member-dashboard-empty">
                <CheckCircle2 size={22} />
                <strong>{loading ? 'Loading deadlines…' : 'Nothing due soon'}</strong>
                <span>{loading ? 'We’re checking your projects.' : 'You’re clear for the next few days.'}</span>
              </div>
            )}
          </div>
          <Link className="member-panel-footer-link" href="/tasks">See all tasks <ArrowRight size={15} /></Link>
        </article>
      </section>

      <section className="member-projects-strip">
        <div className="member-projects-copy">
          <span className="member-panel-icon"><FolderKanban size={18} /></span>
          <div>
            <span className="member-panel-kicker">In your orbit</span>
            <h2>Your projects</h2>
            <p>{projects.length} project{projects.length === 1 ? '' : 's'} you own or collaborate on</p>
          </div>
        </div>
        <div className="member-project-chips">
          {projects.slice(0, 4).map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="member-project-chip">
              <span>{project.title}</span><ArrowRight size={14} />
            </Link>
          ))}
          {!projects.length && !loading && <span className="member-no-projects">No projects yet</span>}
        </div>
        <Link href="/projects" className="member-projects-link">Browse projects <ArrowRight size={15} /></Link>
      </section>

      {showQuickAdd && (
        <div className="member-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowQuickAdd(false); }}>
          <section className="member-quick-modal" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
            <header>
              <div>
                <span className="member-panel-kicker">Keep the momentum</span>
                <h2 id="quick-add-title">Create a task</h2>
              </div>
              <button type="button" onClick={() => setShowQuickAdd(false)} aria-label="Close create task dialog"><X size={18} /></button>
            </header>
            {projects.length ? (
              <form onSubmit={handleQuickAdd} className="member-quick-form">
                <label>
                  Task name
                  <input value={quickForm.title} onChange={(event) => setQuickForm((form) => ({ ...form, title: event.target.value }))} placeholder="What needs to get done?" maxLength={120} required autoFocus />
                </label>
                <label>
                  Project
                  <select value={quickForm.projectId} onChange={(event) => setQuickForm((form) => ({ ...form, projectId: event.target.value }))} required>
                    <option value="">Choose a project</option>
                    {projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}
                  </select>
                </label>
                <div className="member-quick-form-row">
                  <label>
                    Priority
                    <select value={quickForm.priority} onChange={(event) => setQuickForm((form) => ({ ...form, priority: event.target.value }))}>
                      {['Low', 'Medium', 'High', 'Urgent'].map((priority) => <option value={priority} key={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label>
                    Due date
                    <input type="date" value={quickForm.dueDate} onChange={(event) => setQuickForm((form) => ({ ...form, dueDate: event.target.value }))} />
                  </label>
                </div>
                {formError && <p className="member-dashboard-error" role="alert">{formError}</p>}
                <button className="member-primary-button" type="submit" disabled={submitting || !quickForm.title.trim() || !quickForm.projectId}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {submitting ? 'Creating…' : 'Create task'}
                </button>
              </form>
            ) : (
              <div className="member-dashboard-empty">
                <FolderKanban size={24} />
                <strong>Create a project first</strong>
                <span>Tasks need a project to live in.</span>
                <Link href="/projects" className="member-primary-button">Go to projects <ArrowRight size={15} /></Link>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
