import type { Project } from '@/types/project';
import type { User } from '@/types/user';

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
