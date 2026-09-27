export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  assignedTo: string | null;
  project?: { title: string };
  assignee?: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
  attachments?: TaskAttachment[];
}
