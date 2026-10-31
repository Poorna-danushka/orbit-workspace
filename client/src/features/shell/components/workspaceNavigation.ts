import {
  BarChart2,
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Shield,
  User,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

export const workspaceNavigation = [
  { name: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard, exact: true },
  { name: 'Projects', href: ROUTES.projects, icon: FolderKanban, exact: false },
  { name: 'My Tasks', href: ROUTES.tasks, icon: CheckSquare, exact: true },
  { name: 'Analytics', href: ROUTES.analytics, icon: BarChart2, exact: true },
  { name: 'Notifications', href: ROUTES.notifications, icon: Bell, exact: true },
  { name: 'Profile', href: ROUTES.profile, icon: User, exact: true },
  {
    name: 'Admin Console',
    href: ROUTES.adminDashboard,
    icon: Shield,
    exact: false,
    adminOnly: true,
  },
] as const;

export function getWorkspacePageName(pathname: string): string {
  return (
    workspaceNavigation.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    )?.name ?? (pathname.includes(`${ROUTES.projects}/`) ? 'Kanban Board' : 'Dashboard')
  );
}
