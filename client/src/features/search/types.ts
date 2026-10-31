export interface WorkspaceSearchResult {
  projects: { id: string; title: string; description: string | null }[];
  tasks: {
    id: string;
    title: string;
    projectId: string;
    status: string;
    project?: { title: string };
  }[];
}
