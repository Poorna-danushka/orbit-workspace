'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Target,
} from 'lucide-react';
import type { DashboardOverviewProps } from '@/features/dashboard/types';
import { useDashboard } from '../hooks/useDashboard';
import DashboardInsights from './DashboardInsights';
import DashboardProjects from './DashboardProjects';
import DashboardQuickAdd from './DashboardQuickAdd';
import { ROUTES } from '@/lib/constants/routes';

export default function DashboardOverview() {
  const model: DashboardOverviewProps = useDashboard();
  const { user, stats, projects, loading, error, onRefresh, onOpenQuickAdd } = model;
  const quickAddModel = {
    projects: model.projects,
    showQuickAdd: model.showQuickAdd,
    onCloseQuickAdd: model.onCloseQuickAdd,
    onQuickAddSubmit: model.onQuickAddSubmit,
    quickForm: model.quickForm,
    onQuickAddChange: model.onQuickAddChange,
    formError: model.formError,
    submitting: model.submitting,
  };
  const cards = [
    { label: 'All tasks', value: stats?.totalTasks, icon: Target, tone: 'violet' },
    { label: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, tone: 'green' },
    { label: 'In progress', value: stats?.inProgressTasks, icon: Clock3, tone: 'cyan' },
    {
      label: 'Productivity',
      value: stats ? `${stats.productivity}%` : '—',
      icon: Activity,
      tone: 'amber',
    },
  ];

  return (
    <div className="member-dashboard">
      {(stats?.overdueTasks ?? 0) > 0 && (
        <div className="member-overdue-banner">
          <span className="member-overdue-icon">
            <AlertTriangle size={18} />
          </span>
          <p>
            <strong>
              {stats?.overdueTasks} overdue task{stats?.overdueTasks === 1 ? '' : 's'}
            </strong>
            <span>Review what needs your attention.</span>
          </p>
          <Link href={ROUTES.tasks}>
            Open tasks <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <header className="member-dashboard-heading">
        <div>
          <span className="member-dashboard-kicker">Your workspace</span>
          <h1>Welcome back, {user?.username || 'there'}.</h1>
          <p>Here’s what’s moving across your projects today.</p>
        </div>
        <div className="member-dashboard-actions">
          <button
            type="button"
            className="member-refresh-button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button type="button" className="member-primary-button" onClick={onOpenQuickAdd}>
            <Plus size={17} /> New task
          </button>
        </div>
      </header>
      {error && (
        <div className="member-dashboard-error" role="alert">
          <AlertTriangle size={17} />
          <span>{error}</span>
          <button type="button" onClick={onRefresh}>
            Try again
          </button>
        </div>
      )}
      <section className="member-stat-grid" aria-label="Your task summary">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article className={`member-stat-card stat-${tone}`} key={label}>
            <div className="member-stat-top">
              <span className="member-stat-icon">
                <Icon size={18} />
              </span>
              <span className="member-stat-label">{label}</span>
            </div>
            <strong>
              {loading && !stats ? <span className="member-stat-skeleton" /> : (value ?? 0)}
            </strong>
            <span className="member-stat-note">
              {label === 'All tasks'
                ? `${stats?.pendingTasks ?? 0} waiting`
                : label === 'Completed'
                  ? `${stats?.totalProjects ?? 0} projects in your workspace`
                  : label === 'In progress'
                    ? `${stats?.urgentTasks ?? 0} marked urgent`
                    : 'Based on completed tasks'}
            </span>
          </article>
        ))}
      </section>
      <DashboardInsights stats={stats} loading={loading} />
      <DashboardProjects projects={projects} loading={loading} />
      <DashboardQuickAdd model={quickAddModel} />
    </div>
  );
}
