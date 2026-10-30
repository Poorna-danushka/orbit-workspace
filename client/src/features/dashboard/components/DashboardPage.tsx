'use client';

import DashboardOverview from './DashboardOverview';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';

export default function DashboardPage() {
  const model = useDashboard();
  return <DashboardOverview model={model} />;
}
