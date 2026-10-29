import api from '@/lib/api/client';
import type { Task, TaskAttachment } from '@/types/task';

export interface CreateTaskPayload {
  title: string;
  projectId: string;
  description?: string;
  priority?: string;
  dueDate?: string | null;
  status?: string;
  assignedTo?: string | null;
}

export type UpdateTaskPayload = Partial<
  Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'status' | 'assignedTo'>
>;

export type TaskListResponse = Task[] | { data: Task[] };

export const getTasks = () => api.get<TaskListResponse>('/tasks/all?page=1&limit=100');
export const updateTaskStatus = (taskId: string, status: string) =>
  api.patch<Task>(`/tasks/${taskId}/status`, { status });
export const createTask = (payload: CreateTaskPayload) =>
  api.post<Task>('/tasks', payload);
export const updateTask = (taskId: string, payload: UpdateTaskPayload) =>
  api.put<Task>(`/tasks/${taskId}`, payload);
export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`);
export const getTaskAttachments = (taskId: string) =>
  api.get<TaskAttachment[]>(`/uploads/task/${taskId}`);
export const uploadTaskAttachment = (taskId: string, formData: FormData) =>
  api.post<TaskAttachment>(`/uploads/task/${taskId}`, formData);
