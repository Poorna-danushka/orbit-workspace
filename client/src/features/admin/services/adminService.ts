import api from '@/lib/api/client';
import type {
  AdminActivityItem,
  AdminProject,
  AdminStats,
  AdminUser,
} from '../types';

export const getAdminStats = () => api.get<AdminStats>('/admin/stats');
export const getAdminActivity = () => api.get<AdminActivityItem[]>('/admin/activity');
export const broadcastAdminMessage = (message: string) =>
  api.post<{ message: string }>('/admin/broadcast', { message });
export const getAdminProjects = () => api.get<AdminProject[]>('/admin/projects');
export const deleteAdminProject = (projectId: string) =>
  api.delete(`/admin/projects/${projectId}`);
export const getAdminUsers = () => api.get<AdminUser[]>('/admin/users');
export const deleteAdminUser = (userId: string) => api.delete(`/admin/users/${userId}`);
export const changeAdminRole = (userId: string, role: string) =>
  api.patch(`/admin/users/${userId}/role`, { role });
