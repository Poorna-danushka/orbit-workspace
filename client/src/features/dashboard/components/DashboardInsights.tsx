import Link from 'next/link';
import { Activity, ArrowRight, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import type { DashboardStats } from '@/features/dashboard/types';
import { formatDate, getPriorityClass } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import TrendAreaChart from '@/components/ui/TrendAreaChart';

interface DashboardInsightsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function DashboardInsights({ stats, loading }: DashboardInsightsProps) {
  return (
    <section className="member-dashboard-main-grid">
      <article className="member-dashboard-panel member-weekly-panel">
        <div className="member-panel-heading">
          <div>
            <span className="member-panel-kicker">Your workload</span>
            <h2>Task due-date trend</h2>
            <p>Tasks with due dates during the past seven days</p>
          </div>
          <span className="member-panel-icon">
            <CalendarDays size={18} />
          </span>
        </div>
        {stats?.weeklyData?.length ? (
          <div className="member-weekly-chart" aria-label="Tasks due by day this week">
            <TrendAreaChart
              data={stats.weeklyData.map(({ name, tasks }) => ({ name, value: tasks }))}
              variant="dashboard"
            />
          </div>
        ) : (
          <div className="member-dashboard-empty-chart">
            <Activity size={22} />
            <span>
              {loading ? 'Loading your schedule…' : 'No due-date activity to display yet.'}
            </span>
          </div>
        )}
        <div className="member-chart-footer">
          <span>
            <i /> Tasks due
          </span>
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
          <span className="member-panel-icon deadline-icon">
            <Clock3 size={18} />
          </span>
        </div>
        <div className="member-deadline-list">
          {stats?.upcomingDeadlines?.length ? (
            stats.upcomingDeadlines.map((task) => (
              <Link
                className="member-deadline-item"
                href={ROUTES.project(task.projectId)}
                key={task.id}
              >
                <span className="member-deadline-date">
                  {formatDate(task.dueDate, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="member-deadline-title">{task.title}</span>
                <span className="member-deadline-meta">
                  <span>{task.project?.title || 'Project'}</span>
                  <span className={`member-priority-pill ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </span>
                <ArrowRight size={15} className="member-deadline-arrow" />
              </Link>
            ))
          ) : (
            <div className="member-dashboard-empty">
              <CheckCircle2 size={22} />
              <strong>{loading ? 'Loading deadlines…' : 'Nothing due soon'}</strong>
              <span>
                {loading ? 'We’re checking your projects.' : 'You’re clear for the next few days.'}
              </span>
            </div>
          )}
        </div>
        <Link className="member-panel-footer-link" href={ROUTES.tasks}>
          See all tasks <ArrowRight size={15} />
        </Link>
      </article>
    </section>
  );
}
