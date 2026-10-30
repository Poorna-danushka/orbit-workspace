import {
  Activity,
  BarChart2,
  FolderKanban,
  LayoutDashboard,
  User,
  Users,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

export const adminNavigation = [
  { name: 'Overview', href: ROUTES.adminDashboard, icon: LayoutDashboard },
  { name: 'Users', href: ROUTES.adminUsers, icon: Users },
  { name: 'Projects', href: ROUTES.adminProjects, icon: FolderKanban },
  { name: 'Activity', href: ROUTES.adminActivity, icon: Activity },
  { name: 'Analytics', href: ROUTES.adminAnalytics, icon: BarChart2 },
  { name: 'Profile', href: ROUTES.adminProfile, icon: User },
] as const;

export function getAdminPageName(pathname: string): string {
  return adminNavigation.find((item) => item.href === pathname)?.name ?? 'Admin';
}
