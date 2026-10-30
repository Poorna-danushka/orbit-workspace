import api from '@/lib/api/client';
import type { Project } from '@/types/project';
import type { Task } from '@/types/task';
import type {
  ProjectInvitationResponse,
  ProjectListResponse,
  ProjectMemberSearchResult,
} from '../types';

type ProjectInput = Pick<Project, 'title' | 'description' | 'status'>;

export const getProjects = () =>
  api.get<ProjectListResponse>('/projects?page=1&limit=50');
export const getProject = (projectId: string) =>
  api.get<Project>(`/projects/${projectId}`);
export const createProject = (payload: ProjectInput) =>
  api.post<Project>('/projects', payload);
export const updateProject = (projectId: string, payload: ProjectInput) =>
  api.put<Project>(`/projects/${projectId}`, payload);
export const deleteProject = (projectId: string) =>
  api.delete(`/projects/${projectId}`);
export const searchProjectMembers = (query: string) =>
  api.get<ProjectMemberSearchResult[]>(`/user/search?q=${encodeURIComponent(query)}`);
export const addProjectMember = (projectId: string, userId: string, role = 'member') =>
  api.post(`/projects/${projectId}/members`, { userId, role });
export const removeProjectMember = (projectId: string, userId: string) =>
  api.delete(`/projects/${projectId}/members/${userId}`);
export const inviteProjectMember = (projectId: string, email: string) =>
  api.post<{ message?: string }>(`/projects/${projectId}/invite`, { email });
export const getProjectInvitation = (token: string) =>
  api.get<ProjectInvitationResponse>(`/projects/invitations/${token}`);
export const acceptProjectInvitation = (token: string) =>
  api.post(`/projects/invitations/${token}/accept`);
export const rejectProjectInvitation = (token: string) =>
  api.post(`/projects/invitations/${token}/reject`);
export const getProjectTasks = (projectId: string) =>
  api.get<Task[]>(`/tasks/project/${projectId}`);
