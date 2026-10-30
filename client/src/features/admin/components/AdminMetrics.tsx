import { AlertTriangle, CheckCircle2, FolderKanban, Users } from 'lucide-react';
import type { AdminStats } from '@/features/admin/types';
import { formatNumber } from '@/lib/utils/format';

const metricCards: {
  label: string;
  key: 'totalUsers' | 'totalProjects' | 'totalTasks' | 'overdueTasks';
  noteKey?: 'newUsersToday' | 'completedTasks';
  note: string;
  icon: typeof Users;
  tone: 'violet' | 'cyan' | 'green' | 'amber';
}[] = [
  {
    label: 'Total users',
    key: 'totalUsers',
    noteKey: 'newUsersToday',
    note: 'new today',
    icon: Users,
    tone: 'violet',
  },
  {
    label: 'Projects',
    key: 'totalProjects',
    note: 'Across every workspace',
    icon: FolderKanban,
    tone: 'cyan',
  },
  {
    label: 'Tasks tracked',
    key: 'totalTasks',
    noteKey: 'completedTasks',
    note: 'completed',
    icon: CheckCircle2,
    tone: 'green',
  },
  {
    label: 'Overdue tasks',
    key: 'overdueTasks',
    note: 'Need attention',
    icon: AlertTriangle,
    tone: 'amber',
  },
] as const;

export default function AdminMetrics({
  stats,
  loading,
}: {
  stats: AdminStats | null;
  loading: boolean;
}) {
  return (
    <section className="admin-metric-grid" aria-label="Platform statistics">
      {metricCards.map(({ label, key, noteKey, note, icon: Icon, tone }) => {
        const value = stats?.[key];
        const detail = noteKey && stats ? `${formatNumber(stats[noteKey])} ${note}` : note;
        return (
          <article className={`admin-metric-card tone-${tone}`} key={key}>
            <div className="admin-metric-top">
              <span className="admin-metric-icon">
                <Icon size={18} />
              </span>
              {key === 'overdueTasks' && (value ?? 0) > 0 ? (
                <span className="admin-metric-flag">Review</span>
              ) : (
                <span className="admin-metric-period">All time</span>
              )}
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
  );
}
