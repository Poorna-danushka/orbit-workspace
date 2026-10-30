'use client';

import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import type { Task } from '@/features/tasks/types';
import { reportError } from '@/lib/errors';
import { getTasks, updateTaskStatus } from '@/features/tasks/services/taskService';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { PRIORITY_ORDER, isOverdue } from '../utils/taskPresentation';

export type SortKey = 'dueDate' | 'priority' | 'title' | 'status';

export interface TasksPageModel {
  tasks: Task[];
  filtered: Task[];
  loading: boolean;
  statusFilter: string;
  priorityFilter: string;
  search: string;
  sortKey: SortKey;
  updatingId: string | null;
  overdueCount: number;
  completedCount: number;
  onStatusFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
  onStatusChange: (event: ChangeEvent<HTMLSelectElement>, taskId: string) => void;
  onClearFilters: () => void;
}

export function useTasks(): TasksPageModel {
  const loadTasks = useCallback(async () => {
    const response = await getTasks();
    return Array.isArray(response.data) ? response.data : response.data.data;
  }, []);
  const resource = useAsyncResource(loadTasks);
  const tasks = resource.data ?? [];
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (resource.error) reportError(resource.error, 'Failed to load tasks');
  }, [resource.error]);

  const onStatusChange = async (event: ChangeEvent<HTMLSelectElement>, taskId: string) => {
    const newStatus = event.target.value;
    setUpdatingId(taskId);
    try {
      await updateTaskStatus(taskId, newStatus);
      resource.setData((current) =>
        current?.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
      );
    } catch (error: unknown) {
      reportError(error, 'Failed to update task status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = tasks
    .filter((task) => {
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.project?.title.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchPriority && matchSearch;
    })
    .sort((left, right) => {
      if (sortKey === 'priority')
        return (PRIORITY_ORDER[left.priority] ?? 4) - (PRIORITY_ORDER[right.priority] ?? 4);
      if (sortKey === 'title') return left.title.localeCompare(right.title);
      if (sortKey === 'status') return left.status.localeCompare(right.status);
      if (!left.dueDate && !right.dueDate) return 0;
      if (!left.dueDate) return 1;
      if (!right.dueDate) return -1;
      return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
    });

  return {
    tasks,
    filtered,
    loading: resource.loading,
    statusFilter,
    priorityFilter,
    search,
    sortKey,
    updatingId,
    overdueCount: tasks.filter(isOverdue).length,
    completedCount: tasks.filter((task) => task.status === 'Completed').length,
    onStatusFilterChange: setStatusFilter,
    onPriorityFilterChange: setPriorityFilter,
    onSearchChange: setSearch,
    onSortChange: setSortKey,
    onStatusChange,
    onClearFilters: () => {
      setStatusFilter('all');
      setPriorityFilter('all');
      setSearch('');
    },
  };
}
