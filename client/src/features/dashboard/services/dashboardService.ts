import api from '@/lib/api/client';
import type { Project } from '@/types/project';
import type { CreateTaskPayload } from '@/features/tasks/services/taskService';
import type { DashboardStats } from '@/features/dashboard/types';

type DashboardProjectList = Project[] | { data?: Project[] };

export const getDashboardStats = () => api.get<DashboardStats>('/dashboard/stats');
export const getDashboardProjects = () =>
  api.get<DashboardProjectList>('/projects?page=1&limit=50');
export const createDashboardTask = (payload: CreateTaskPayload) =>
  api.post('/tasks', payload);
