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
