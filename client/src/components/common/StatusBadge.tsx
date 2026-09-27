'use client';

interface StatusBadgeProps {
  status: string;
  type?: 'task' | 'project' | 'priority' | 'role';
  className?: string;
}

export default function StatusBadge({ status, type = 'task', className = '' }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || '';

  let bg = 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  if (type === 'priority') {
    if (normalized === 'high' || normalized === 'urgent') {
      bg = 'bg-red-500/10 text-red-400 border-red-500/20';
    } else if (normalized === 'medium') {
      bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (normalized === 'low') {
      bg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  } else if (type === 'project' || type === 'task') {
    if (normalized === 'completed' || normalized === 'done' || normalized === 'active') {
      bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (normalized === 'in_progress' || normalized === 'in progress') {
      bg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    } else if (normalized === 'todo' || normalized === 'pending' || normalized === 'planning') {
      bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (normalized === 'archived' || normalized === 'cancelled') {
      bg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  } else if (type === 'role') {
    if (normalized === 'admin') {
      bg = 'bg-red-500/10 text-red-400 border-red-500/20';
    } else {
      bg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${bg} ${className}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
