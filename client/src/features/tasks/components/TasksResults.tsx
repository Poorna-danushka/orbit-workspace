'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, CheckSquare, Loader2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { Task } from '@/features/tasks/types';
import { ROUTES } from '@/lib/constants/routes';
import {
  PRIORITY_COLORS,
  STATUS_ICONS,
  STATUS_OPTIONS,
  isOverdue,
} from '@/features/tasks/utils/taskPresentation';

type TasksResultsModel = {
  tasks: Task[];
  filtered: Task[];
  updatingId: string | null;
  onStatusChange: (event: ChangeEvent<HTMLSelectElement>, taskId: string) => void;
  onClearFilters: () => void;
};

export default function TasksResults({ model }: { model: TasksResultsModel }) {
  const {
    tasks,
    filtered,
    updatingId,
    onStatusChange,
    onClearFilters,
  } = model;
  return (
    <>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
            <CheckSquare className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match filters'}
          </h3>
          <p className="text-gray-500 text-sm max-w-xs text-center mb-6">
            {tasks.length === 0
              ? 'Create a project and add some tasks to see them appear here.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {tasks.length === 0 ? (
            <Link
              href={ROUTES.projects}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
            >
              Go to Projects <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => {
                onClearFilters();
              }}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((task) => {
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#11131b] border shadow-lg shadow-black/10 hover:bg-white/[0.05] transition-all group ${
                  overdue
                    ? 'border-red-500/30'
                    : task.status === 'Completed'
                      ? 'opacity-60 border-white/[0.06]'
                      : 'border-white/[0.08]'
                }`}
              >
                {/* Status + Title */}
                <div className="flex flex-1 items-start gap-3 min-w-0">
                  <div className="mt-1 flex-shrink-0">
                    {STATUS_ICONS[task.status] || STATUS_ICONS.Todo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link
                        href={ROUTES.project(task.projectId)}
                        className={`text-base font-semibold group-hover:text-purple-400 transition-colors truncate ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-white'}`}
                      >
                        {task.title}
                      </Link>
                      {overdue && (
                        <span className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <Link
                        href={ROUTES.project(task.projectId)}
                        className="hover:text-purple-400 transition-colors truncate"
                      >
                        {task.project?.title}
                      </Link>
                      {task.dueDate && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span
                            className={`flex items-center gap-1.5 ${overdue ? 'text-red-400' : ''}`}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}
                  >
                    {task.priority}
                  </span>
                  <div className="relative">
                    {updatingId === task.id ? (
                      <div className="px-3 py-1.5 border border-white/10 rounded-lg bg-black/20 flex items-center justify-center w-[120px]">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      </div>
                    ) : (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(e, task.id)}
                        className={`w-[120px] bg-black/40 border border-white/10 rounded-lg text-xs font-medium px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer transition-colors hover:border-white/20 ${
                          task.status === 'Completed' ? 'text-green-400' : 'text-gray-300'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
