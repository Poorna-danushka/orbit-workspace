'use client';

import AdminDashboardOverview from './AdminDashboardOverview';
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard';

export default function AdminDashboardPage() {
  const model = useAdminDashboard();
  return <AdminDashboardOverview model={model} />;
}
