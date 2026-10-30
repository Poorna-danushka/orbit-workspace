import type { FormEvent } from 'react';
import type { Project } from '@/features/projects/types';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  urgentTasks: number;
  overdueTasks: number;
  productivity: number;
  totalProjects: number;
  weeklyData: { name: string; tasks: number; completed: number }[];
  upcomingDeadlines: {
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    projectId: string;
    project: { title: string };
  }[];
}

export type DashboardOverviewProps = {
  user?: { username?: string | null } | null;
  stats: DashboardStats | null;
  projects: Project[];
  loading: boolean;
  error: string;
  showQuickAdd: boolean;
  quickForm: {
    title: string;
    projectId: string;
    priority: string;
    dueDate: string;
  };
  submitting: boolean;
  formError: string;
  onRefresh: () => void;
  onOpenQuickAdd: () => void;
  onCloseQuickAdd: () => void;
  onQuickAddChange: (field: 'title' | 'projectId' | 'priority' | 'dueDate', value: string) => void;
  onQuickAddSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
