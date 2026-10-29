import api from '@/lib/api/client';
import type { DashboardProjectList } from '../types';
import { getDashboardStats } from '@/lib/api/user';
import type { CreateTaskPayload } from '@/features/tasks/services/taskService';

export { getDashboardStats };
export const getDashboardProjects = () =>
  api.get<DashboardProjectList>('/projects?page=1&limit=50');
export const createDashboardTask = (payload: CreateTaskPayload) =>
  api.post('/tasks', payload);
