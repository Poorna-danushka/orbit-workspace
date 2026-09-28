import api from '../axios';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt?: string;
}

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

export const getDashboardStats = () => api.get<DashboardStats>('/dashboard/stats');
export const getNotifications = () => api.get('/notifications');
export const getProfile = () => api.get<UserProfile>('/user/me');
export const updateProfile = (payload: { username: string }) => api.patch<{ message: string; user: UserProfile }>('/user/profile', payload);
export const changePassword = (payload: { currentPassword: string; newPassword: string }) => api.patch<{ message: string }>('/user/change-password', payload);
export const uploadAvatar = (formData: FormData) => api.post<{ message: string; user: UserProfile }>('/user/avatar', formData);
export const searchGlobal = (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`);
