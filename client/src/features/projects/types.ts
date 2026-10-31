import type { User } from '@/types/user';

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  ownerId?: string;
  owner?: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  members?: ProjectMember[];
  _count?: { tasks: number };
}

export type ProjectListResponse = Project[] | { data?: Project[] };
export type ProjectMemberSearchResult = Pick<User, 'id' | 'username' | 'email' | 'avatar'>;
export interface ProjectInvitation {
  status: string;
  invitedEmail: string;
  project?: { title?: string; description?: string | null };
  inviter?: { username?: string };
}
export interface ProjectInvitationResponse {
  invitation: ProjectInvitation;
}

type ChatUser = Pick<User, 'id' | 'username' | 'avatar'>;

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: ChatUser;
}
