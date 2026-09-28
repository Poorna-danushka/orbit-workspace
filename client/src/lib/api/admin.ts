import api from '../axios';

export interface AdminRecentUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
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

export const getAdminStats = () => api.get<AdminStats>('/admin/stats');
export const getAdminActivity = () => api.get<AdminActivityItem[]>('/admin/activity');
export const getAdminUsers = () => api.get('/admin/users');
export const deleteAdminUser = (id: string) => api.delete(`/admin/users/${id}`);
export const changeAdminRole = (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role });
export const getAdminProjects = () => api.get('/admin/projects');
export const deleteAdminProject = (id: string) => api.delete(`/admin/projects/${id}`);
export const broadcastMessage = (message: string) => api.post<{ message: string }>('/admin/broadcast', { message });
export const getAdminProfile = () => api.get('/admin/profile');
export const updateAdminProfile = (payload: { username: string }) => api.patch('/admin/profile', payload);
export const changeAdminPassword = (payload: { currentPassword: string; newPassword: string }) => api.patch('/admin/change-password', payload);
export const uploadAdminAvatar = (formData: FormData) => api.post('/admin/avatar', formData);
