export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  urgentTasks: number;
  overdueTasks: number;
  productivity: number;
  totalProjects: number;
  weeklyData: { name: string; tasks: number; completed: number }[];
  upcomingDeadlines: {
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    projectId: string;
    project: { title: string };
  }[];
}
