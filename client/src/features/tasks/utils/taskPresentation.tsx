import { AlertTriangle, CheckSquare, Circle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Task } from '@/features/tasks/types';

export const PRIORITY_ORDER: Record<string, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
  High: 'text-orange-400 bg-orange-400/10 border border-orange-400/20',
  Urgent:
    'text-red-400 bg-red-400/10 border border-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.3)]',
};

export const STATUS_ICONS: Record<string, ReactNode> = {
  Todo: <Circle className="w-4 h-4 text-gray-500" />,
  'In Progress': <Clock className="w-4 h-4 text-blue-400" />,
  Review: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  Completed: <CheckSquare className="w-4 h-4 text-green-400" />,
};

export const STATUS_OPTIONS = ['Todo', 'In Progress', 'Review', 'Completed'];

export function isOverdue(task: Task): boolean {
  return Boolean(
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed',
  );
}
