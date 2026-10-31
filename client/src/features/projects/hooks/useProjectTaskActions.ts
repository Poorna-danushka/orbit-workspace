import type { ChangeEvent, Dispatch, FormEvent, MouseEvent, SetStateAction } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { COLUMNS } from '../constants/kanban';
import { getErrorMessage, reportError } from '@/lib/errors';
import {
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  uploadTaskAttachment,
} from '@/features/tasks/services/taskService';
import type { Task } from '@/features/tasks/types';
import type { NewTaskForm } from '../components/CreateTaskModal';
import { getTaskUploadValidationError } from '../utils/taskUploadValidation';

interface ProjectTaskActionsParams {
  projectId: string;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  viewingTask: Task | null;
  setViewingTask: Dispatch<SetStateAction<Task | null>>;
  newTask: NewTaskForm;
  setNewTask: Dispatch<SetStateAction<NewTaskForm>>;
  defaultStatus: string;
  setActiveTask: Dispatch<SetStateAction<Task | null>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setCreating: Dispatch<SetStateAction<boolean>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadError: Dispatch<SetStateAction<string | null>>;
}

export default function useProjectTaskActions({
  projectId,
  tasks,
  setTasks,
  viewingTask,
  setViewingTask,
  newTask,
  setNewTask,
  defaultStatus,
  setActiveTask,
  setIsModalOpen,
  setCreating,
  setUploading,
  setUploadError,
}: ProjectTaskActionsParams) {
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const newStatus =
      COLUMNS.find((col) => col === over.id) || tasks.find((t) => t.id === over.id)?.status;

    if (newStatus) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        // Optimistic UI update
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

        // Persist
        try {
          await updateTaskStatus(taskId, newStatus);
        } catch (error: unknown) {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)),
          );
          reportError(error, 'Failed to update task status');
        }
      }
    }
  };

  const handleMoveTaskStatus = async (taskId: string, nextStatus: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));

    try {
      // Persist
      await updateTaskStatus(taskId, nextStatus);
    } catch (error) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)));
      reportError(error, 'Failed to update task status');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!viewingTask) return;
    try {
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t.id === viewingTask.id ? { ...t, status: newStatus } : t)),
      );
      setViewingTask((prev) => (prev ? { ...prev, status: newStatus } : null));

      // Persist
      await updateTaskStatus(viewingTask.id, newStatus);
    } catch (error: unknown) {
      setTasks((prev) =>
        prev.map((t) => (t.id === viewingTask.id ? { ...t, status: viewingTask.status } : t)),
      );
      setViewingTask((prev) => (prev ? { ...prev, status: viewingTask.status } : null));
      reportError(error, 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string, e: MouseEvent) => {
    e.stopPropagation();
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (error: unknown) {
      setTasks(previousTasks);
      reportError(error, 'Failed to delete task');
    }
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createTask({
        ...newTask,
        projectId: projectId,
        status: newTask.status || defaultStatus,
        assignedTo: newTask.assignedTo || null,
      });
      setTasks((prev) => [...prev, { ...res.data, attachments: [] }]);
      setIsModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Todo',
        assignedTo: '',
      });
    } catch (err) {
      reportError(err, 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleAssigneeChange = async (assignedToId: string) => {
    if (!viewingTask) return;
    try {
      // Send only the assignedTo field — backend uses partial update
      const res = await updateTask(viewingTask.id, {
        assignedTo: assignedToId || null,
      });
      const updatedTask = res.data;

      // Update state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === viewingTask.id
            ? { ...t, assignee: updatedTask.assignee, assignedTo: updatedTask.assignedTo }
            : t,
        ),
      );
      setViewingTask((prev) =>
        prev
          ? { ...prev, assignee: updatedTask.assignee, assignedTo: updatedTask.assignedTo }
          : null,
      );
    } catch (error: unknown) {
      reportError(error, 'Failed to update task assignee');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !viewingTask) return;
    const file = e.target.files[0];
    setUploadError(null);

    const validationError = getTaskUploadValidationError(file);
    if (validationError) {
      setUploadError(validationError);
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await uploadTaskAttachment(viewingTask.id, formData);
      const newAttachment = res.data;

      // Update local state
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === viewingTask.id) {
            const updated = { ...t, attachments: [...(t.attachments || []), newAttachment] };
            setViewingTask(updated);
            return updated;
          }
          return t;
        }),
      );
    } catch (error: unknown) {
      setUploadError(getErrorMessage(error, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleMoveTaskStatus,
    handleStatusChange,
    handleDeleteTask,
    handleCreateTask,
    handleAssigneeChange,
    handleFileUpload,
  };
}
