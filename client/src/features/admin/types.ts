import type { FormEvent } from 'react';
import type { Project } from '@/features/projects/types';
import type { User } from '@/types/user';

export type AdminUser = User & { createdAt: string };
export type AdminProject = Omit<Project, 'description'> & {
  description: string | null;
  owner: Pick<User, 'id' | 'username' | 'email'>;
  _count: { tasks: number };
};

interface AdminRecentUser extends User {
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  notifications: number;
  recentUsers: AdminRecentUser[];
  tasksCompletedToday: number;
  newUsersToday: number;
  userGrowth: { name: string; users: number }[];
}

export interface AdminActivityItem {
  id: string;
  type: 'register' | 'role_change' | 'project_create' | 'task_complete' | 'notification';
  label: string;
  user: string;
  time: string;
}

export type AdminDashboardOverviewProps = {
  stats: AdminStats | null;
  activities: AdminActivityItem[];
  loading: boolean;
  error: string;
  broadcast: string;
  sending: boolean;
  broadcastStatus: string;
  broadcastError: string;
  completionRate: number;
  recentUsers: AdminStats['recentUsers'];
  onRefresh: () => void;
  onBroadcastChange: (value: string) => void;
  onBroadcastSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
