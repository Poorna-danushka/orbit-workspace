'use client';

import { useCallback } from 'react';
import { Activity, Clock3, Loader2, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';
import { getAdminActivity } from '@/features/admin/services/adminService';
import type { AdminActivityItem } from '@/features/admin/types';
import ErrorState from '@/components/ui/ErrorState';
import { useAsyncResource } from '@/hooks/useAsyncResource';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminActivityPage() {
  const loadActivity = useCallback(async () => (await getAdminActivity()).data, []);
  const { data: items = [], loading, error: loadError, reload: fetchActivity } =
    useAsyncResource<AdminActivityItem[]>(loadActivity);
  const error = loadError
    ? getErrorMessage(loadError, 'Could not load platform activity.')
    : '';

  return (
    <div className="admin-overview">
      <header className="admin-overview-heading">
        <div>
          <div className="admin-eyebrow"><span className="admin-eyebrow-dot" /> Platform pulse</div>
          <h1>Recent activity</h1>
          <p>A live feed of account, project, task, and notification events.</p>
        </div>
        <button type="button" onClick={() => void fetchActivity()} disabled={loading} className="admin-action-button">
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          {loading ? 'Updating' : 'Refresh feed'}
        </button>
      </header>

      {error ? (
        <section className="admin-panel">
          <ErrorState title="Activity feed unavailable" message={error} onRetry={() => void fetchActivity()} />
        </section>
      ) : (
        <section className="admin-panel">
          <div className="admin-panel-heading admin-panel-heading-inline">
            <div>
              <div className="admin-section-kicker">Event stream</div>
              <h2>Platform timeline</h2>
              <p>{items.length} latest recorded events</p>
            </div>
            <span className="admin-panel-icon"><Activity size={18} /></span>
          </div>

          {loading && !items.length ? (
            <div className="admin-empty-state" role="status"><Loader2 className="animate-spin" size={20} />Loading platform activity…</div>
          ) : items.length === 0 ? (
            <div className="admin-empty-state"><Activity size={20} />No recent activity yet.</div>
          ) : (
            <ol className="admin-activity-list">
              {items.map((item) => (
                <li key={item.id} className="admin-activity-item">
                  <span className={`admin-activity-marker marker-${item.type}`}><Clock3 size={15} /></span>
                  <span className="admin-activity-line" aria-hidden="true" />
                  <div className="admin-activity-copy">
                    <p>{item.label}</p>
                    <span>{item.type.replaceAll('_', ' ')} <span aria-hidden="true">·</span> {item.user} <span aria-hidden="true">·</span> {formatDate(item.time)}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
