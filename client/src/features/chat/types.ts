import type { User } from '@/types/user';

type ChatUser = Pick<User, 'id' | 'username' | 'avatar'>;

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: ChatUser;
}
