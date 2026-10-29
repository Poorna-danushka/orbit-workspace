import type { Project } from '@/types/project';

export type DashboardProjectList = Project[] | { data?: Project[] };
export type { DashboardStats } from '@/lib/api/user';
