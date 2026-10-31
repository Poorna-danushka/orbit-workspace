'use client';

import { AlertTriangle, ArrowUpDown, Loader2, X } from 'lucide-react';
import TasksResults from './TasksResults';
import { useTasks, type SortKey } from '../hooks/useTasks';
import { STATUS_OPTIONS } from '../utils/taskPresentation';

export default function Tasks() {
  const {
    tasks,
    filtered,
    loading,
    statusFilter,
    priorityFilter,
    search,
    sortKey,
    updatingId,
    overdueCount,
    completedCount,
    onStatusFilterChange: setStatusFilter,
    onPriorityFilterChange: setPriorityFilter,
    onSearchChange: setSearch,
    onSortChange: setSortKey,
    onStatusChange: handleStatusChange,
    onClearFilters,
  } = useTasks();

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Tasks</h2>
          <p className="text-gray-400 text-sm mt-1">
            {tasks.length} total · {completedCount} completed
            {overdueCount > 0 && (
              <span className="text-red-400 ml-2">· {overdueCount} overdue</span>
            )}
          </p>
        </div>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>
            <strong>{overdueCount}</strong> task{overdueCount > 1 ? 's are' : ' is'} overdue —
            consider resolving them first.
          </span>
        </div>
      )}

      {/* Filters + Sort Bar */}
      <div className="p-4 rounded-2xl bg-[#11131b] border border-white/[0.08] shadow-lg shadow-black/10 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or projects..."
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 min-w-[120px] sm:min-w-0">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            >
              <option value="all">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 min-w-[120px] sm:min-w-0">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            >
              <option value="all">All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 min-w-[120px] sm:min-w-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title A–Z</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Clear */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setSearch('');
              }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto sm:ml-0"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-600">
        Showing {filtered.length} of {tasks.length} tasks
      </p>

      <TasksResults
        model={{
          tasks,
          filtered,
          updatingId,
          onStatusChange: handleStatusChange,
          onClearFilters,
        }}
      />
    </div>
  );
}
