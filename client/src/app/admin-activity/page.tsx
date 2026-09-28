'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Clock3, Loader2, RefreshCw } from 'lucide-react';
import { AxiosError } from 'axios';
import { getAdminActivity, type AdminActivityItem } from '@/lib/api/admin';
import ErrorState from '@/components/ui/ErrorState';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as { message?: string } | undefined;
    return response?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Could not load platform activity.';
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminActivityPage() {
  const [items, setItems] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminActivity();
      setItems(response.data);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchActivity(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchActivity]);

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
