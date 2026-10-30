'use client';

import { useCallback, useState, type FormEvent } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getDashboardProjects, getDashboardStats, createDashboardTask } from '@/features/dashboard/services/dashboardService';
import type { DashboardStats } from '@/features/dashboard/types';
import { getErrorMessage } from '@/lib/errors';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import type { Project } from '@/features/projects/types';
import type { DashboardOverviewProps } from '@/features/dashboard/components/DashboardOverview';

interface DashboardResource {
  stats: DashboardStats;
  projects: Project[];
}

export function useDashboard(): DashboardOverviewProps {
  const user = useAppSelector((state) => state.auth.user);
  const loadDashboard = useCallback(async (): Promise<DashboardResource> => {
    const [statsResponse, projectsResponse] = await Promise.all([
      getDashboardStats(),
      getDashboardProjects(),
    ]);
    const projectData = projectsResponse.data;
    return {
      stats: statsResponse.data,
      projects: Array.isArray(projectData) ? projectData : projectData.data ?? [],
    };
  }, []);
  const resource = useAsyncResource(loadDashboard);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickForm, setQuickForm] = useState({ title: '', projectId: '', priority: 'Medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const data = resource.data;

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
      await resource.reload();
    } catch (submitError: unknown) {
      setFormError(getErrorMessage(submitError, 'Could not create the task.'));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    stats: data?.stats ?? null,
    projects: data?.projects ?? [],
    loading: resource.loading,
    error: resource.error ? getErrorMessage(resource.error, 'Could not load your workspace overview.') : '',
    showQuickAdd,
    quickForm,
    submitting,
    formError,
    onRefresh: () => void resource.reload(),
    onOpenQuickAdd: () => {
      setFormError('');
      setShowQuickAdd(true);
    },
    onCloseQuickAdd: () => setShowQuickAdd(false),
    onQuickAddChange: (field, value) => setQuickForm((current) => ({ ...current, [field]: value })),
    onQuickAddSubmit: handleQuickAdd,
  };
}
