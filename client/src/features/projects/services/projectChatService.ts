import api from '@/lib/api/client';
import type { ChatMessage } from '../types';

export const getProjectChatMessages = (projectId: string) =>
  api.get<ChatMessage[]>(`/chats/project/${projectId}/messages`);
export const uploadProjectChatFile = (projectId: string, formData: FormData) =>
  api.post<{ fileUrl?: string }>(`/uploads/project/${projectId}`, formData);
