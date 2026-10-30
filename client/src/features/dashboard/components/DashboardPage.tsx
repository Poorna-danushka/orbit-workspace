'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { getDashboardProjects, getDashboardStats, createDashboardTask } from '@/features/dashboard/services/dashboardService';
import type { DashboardStats } from '@/features/dashboard/types';
import { getErrorMessage } from '@/lib/errors';
import type { RootState } from '@/store';
import type { Project } from '@/types/project';
import DashboardOverview from './DashboardOverview';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
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
        getDashboardProjects(),
      ]);
      setStats(statsResponse.data);
      const projectData = projectsResponse.data;
      setProjects(Array.isArray(projectData) ? projectData : projectData.data ?? []);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Could not load your workspace overview.'));
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
      await createDashboardTask({
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
      setFormError(getErrorMessage(submitError, 'Could not create the task.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardOverview
      user={user}
      stats={stats}
      projects={projects}
      loading={loading}
      error={error}
      showQuickAdd={showQuickAdd}
      quickForm={quickForm}
      submitting={submitting}
      formError={formError}
      onRefresh={() => void loadDashboard()}
      onOpenQuickAdd={() => {
        setFormError('');
        setShowQuickAdd(true);
      }}
      onCloseQuickAdd={() => setShowQuickAdd(false)}
      onQuickAddChange={(field, value) => {
        setQuickForm((current) => ({ ...current, [field]: value }));
      }}
      onQuickAddSubmit={handleQuickAdd}
    />
  );
}
