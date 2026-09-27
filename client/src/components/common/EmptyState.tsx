'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconColor = 'text-gray-500',
  iconBg = 'bg-white/5',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
      <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-xs text-center mb-6 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
