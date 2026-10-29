import type { Project } from '@/types/project';
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
  type: string;
  label: string;
  user: string;
  time: string;
}
