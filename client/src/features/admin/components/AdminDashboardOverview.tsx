'use client';

import { AlertTriangle, Bell, Loader2, Send } from 'lucide-react';
import type { AdminDashboardOverviewProps } from '@/features/admin/types';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import AdminMetrics from './AdminMetrics';
import AdminPerformance from './AdminPerformance';
import AdminActivityPanels from './AdminActivityPanels';

export default function AdminDashboardOverview() {
  const model: AdminDashboardOverviewProps = useAdminDashboard();
  const {
    stats,
    activities,
    loading,
    error,
    broadcast,
    sending,
    broadcastStatus,
    broadcastError,
    completionRate,
    recentUsers,
    onRefresh,
    onBroadcastChange,
    onBroadcastSubmit,
  } = model;
  return (
    <div className="admin-overview">
      <header className="admin-overview-heading">
        <div>
          <div className="admin-eyebrow">
            <span className="admin-eyebrow-dot" /> Control room
          </div>
          <h1>Platform overview</h1>
          <p>A live snapshot of your people, projects, and work in Orbit.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="admin-action-button"
        >
          <Loader2 className={loading ? 'animate-spin' : ''} size={16} />
          {loading ? 'Updating' : 'Refresh data'}
        </button>
      </header>
      {error && (
        <div role="alert" className="admin-alert admin-alert-error">
          <div>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={onRefresh}>
            Retry
          </button>
        </div>
      )}
      <AdminMetrics stats={stats} loading={loading} />
      <AdminPerformance stats={stats} loading={loading} completionRate={completionRate} />
      <AdminActivityPanels activities={activities} recentUsers={recentUsers} loading={loading} />
      <section className="admin-broadcast-panel">
        <div className="admin-broadcast-intro">
          <span className="admin-broadcast-icon">
            <Bell size={19} />
          </span>
          <div>
            <div className="admin-section-kicker">Platform communication</div>
            <h2>Send an announcement</h2>
            <p>Deliver a notification to every registered user.</p>
          </div>
        </div>
        <form onSubmit={onBroadcastSubmit} className="admin-broadcast-form">
          <label className="sr-only" htmlFor="admin-broadcast-message">
            Announcement message
          </label>
          <textarea
            id="admin-broadcast-message"
            value={broadcast}
            onChange={(event) => onBroadcastChange(event.target.value.slice(0, 500))}
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
          {broadcastStatus && (
            <p className="admin-form-feedback feedback-success" role="status">
              {broadcastStatus}
            </p>
          )}
          {broadcastError && (
            <p className="admin-form-feedback feedback-error" role="alert">
              {broadcastError}
            </p>
          )}
        </form>
      </section>
      {loading && stats && (
        <p className="admin-refresh-note" role="status">
          <Loader2 size={14} className="animate-spin" /> Refreshing live data…
        </p>
      )}
    </div>
  );
}
