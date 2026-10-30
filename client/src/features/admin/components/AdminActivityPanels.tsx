import Link from 'next/link';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Users } from 'lucide-react';
import type { AdminActivityItem, AdminStats } from '@/features/admin/types';
import { formatDate, getInitials } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';

export default function AdminActivityPanels({
  activities,
  recentUsers,
  loading,
}: {
  activities: AdminActivityItem[];
  recentUsers: AdminStats['recentUsers'];
  loading: boolean;
}) {
  return (
    <section className="admin-lower-grid">
      <article className="admin-panel admin-activity-panel">
        <div className="admin-panel-heading admin-panel-heading-inline">
          <div>
            <div className="admin-section-kicker">What’s happening</div>
            <h2>Recent activity</h2>
            <p>Latest events recorded across the platform</p>
          </div>
          <Link className="admin-text-link" href={ROUTES.adminActivity}>
            All activity <ArrowRight size={15} />
          </Link>
        </div>
        {activities.length ? (
          <ol className="admin-activity-list">
            {activities.slice(0, 5).map((item, index) => (
              <li key={`${item.type}-${item.time}-${index}`} className="admin-activity-item">
                <span className={`admin-activity-marker marker-${item.type}`}>
                  <Activity size={15} />
                </span>
                <span className="admin-activity-line" aria-hidden="true" />
                <div className="admin-activity-copy">
                  <p>{item.label}</p>
                  <span>
                    {item.user} <span aria-hidden="true">·</span> {formatDate(item.time)}
                  </span>
                </div>
                {item.type.includes('register') && (
                  <ArrowUpRight className="admin-activity-trend" size={16} />
                )}
                {item.type.includes('notification') && (
                  <ArrowDownRight className="admin-activity-trend" size={16} />
                )}
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
          <Link className="admin-icon-link" href={ROUTES.adminUsers} aria-label="Manage users">
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="admin-recent-users">
          {recentUsers.map((user, index) => (
            <div className="admin-recent-user" key={user.id}>
              <span className={`admin-user-initial initial-${index % 4}`}>
                {getInitials(user.username)}
              </span>
              <span className="admin-user-details">
                <strong>{user.username}</strong>
                <span>{user.email}</span>
              </span>
              <span className={`admin-role-pill ${user.role === 'admin' ? 'role-admin' : ''}`}>
                {user.role}
              </span>
            </div>
          ))}
          {!recentUsers.length && (
            <div className="admin-empty-state">
              <Users size={20} />
              <span>{loading ? 'Loading accounts…' : 'No user accounts to display.'}</span>
            </div>
          )}
        </div>
        <Link href={ROUTES.adminUsers} className="admin-manage-users">
          Open user management <ArrowRight size={15} />
        </Link>
      </article>
    </section>
  );
}
