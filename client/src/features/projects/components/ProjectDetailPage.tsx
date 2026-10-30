'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Loader2 } from 'lucide-react';
import { acquireSocket, releaseSocket } from '@/lib/realtime/socket';
import { getErrorMessage } from '@/lib/errors';
import { getProject, getProjectTasks } from '@/features/projects/services/projectService';
import { getTaskAttachments } from '@/features/tasks/services/taskService';
import {
  getNotifications,
  markAllNotificationsRead,
} from '@/features/notifications/services/notificationService';
import type { Project, ProjectMember } from '@/types/project';
import type { Task } from '@/types/task';
import ProjectKanbanWorkspace from './ProjectKanbanWorkspace';
import { reportError } from '@/lib/errors';
import useProjectTaskActions from './useProjectTaskActions';
import { generateProjectPdf } from '@/features/projects/services/projectReportService';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('Todo');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Todo',
    assignedTo: '',
  });
  const [creating, setCreating] = useState(false);

  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  /** Error message shown below the Upload button — cleared on next upload attempt */
  const [uploadError, setUploadError] = useState<string | null>(null);

  const openTaskModal = (status: string) => {
    setDefaultStatus(status);
    setNewTask((previous) => ({ ...previous, status, assignedTo: '' }));
    setIsModalOpen(true);
  };

  const {
    handleDragStart,
    handleDragEnd,
    handleMoveTaskStatus,
    handleStatusChange,
    handleDeleteTask,
    handleCreateTask,
    handleAssigneeChange,
    handleFileUpload,
  } = useProjectTaskActions({
    projectId: String(id),
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
  });

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      const count = notifications.filter((item) => !item.isRead).length;
      setUnreadNotifications(count);
    } catch (error) {
      reportError(error, 'Failed to fetch project notifications');
    }
  }, []);

  const fetchProject = useCallback(async () => {
    setLoadError(null);
    try {
      const [projRes, taskRes] = await Promise.all([
        getProject(String(id)),
        getProjectTasks(String(id)),
      ]);
      setProject(projRes.data);

      const taskList = taskRes.data;
      const tasksWithAttachments = await Promise.all(
        taskList.map(async (task: Task) => {
          const attRes = await getTaskAttachments(task.id);
          return { ...task, attachments: attRes.data };
        }),
      );
      setTasks(tasksWithAttachments);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load this project.'));
      reportError(error, 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const socket = acquireSocket();
    const onTaskChanged = (data: { taskId: string; status: string }) => {
      setTasks((previous) =>
        previous.map((task) => (task.id === data.taskId ? { ...task, status: data.status } : task)),
      );
    };
    const onNotificationReceived = () => void fetchUnreadNotifications();
    const onMemberAdded = (newMember: ProjectMember) => {
      setProject((previous) => {
        if (!previous) return null;
        const members = previous.members ?? [];
        if (members.some((member) => member.id === newMember.id)) return previous;
        return { ...previous, members: [...members, newMember] };
      });
    };
    const onMemberRemoved = (data: { projectId: string; userId: string }) => {
      setProject((previous) => {
        if (!previous) return null;
        return {
          ...previous,
          members: (previous.members ?? []).filter((member) => member.userId !== data.userId),
        };
      });
      setTasks((previous) =>
        previous.map((task) =>
          task.assignedTo === data.userId ? { ...task, assignedTo: null, assignee: null } : task,
        ),
      );
      setViewingTask((previous) =>
        previous?.assignedTo === data.userId
          ? { ...previous, assignedTo: null, assignee: null }
          : previous,
      );
    };

    if (id) {
      socket.emit('joinProject', id);
      socket.on('taskChanged', onTaskChanged);
      socket.on('notificationReceived', onNotificationReceived);
      socket.on('memberAdded', onMemberAdded);
      socket.on('memberRemoved', onMemberRemoved);

      /* eslint-disable react-hooks/set-state-in-effect */
      void fetchProject();
      void fetchUnreadNotifications();
      /* eslint-enable react-hooks/set-state-in-effect */
    }

    return () => {
      socket.off('taskChanged', onTaskChanged);
      socket.off('notificationReceived', onNotificationReceived);
      socket.off('memberAdded', onMemberAdded);
      socket.off('memberRemoved', onMemberRemoved);
      releaseSocket();
    };
  }, [id, fetchProject, fetchUnreadNotifications]);

  // Keyboard shortcut to open New Task modal when pressing 'N'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setDefaultStatus('Todo');
        setNewTask((p) => ({ ...p, status: 'Todo', assignedTo: '' }));
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChatToggle = async () => {
    if (!showChat) {
      setUnreadNotifications(0);
      try {
        await markAllNotificationsRead();
      } catch (error) {
        reportError(error, 'Failed to mark project notifications as read');
        fetchUnreadNotifications();
      }
    }
    setShowChat((prev) => !prev);
  };

  const handleGenerateProjectPdf = () => {
    if (!project) return;
    generateProjectPdf(project, tasks);
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  if (loadError) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <p role="alert" className="text-sm text-red-400">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void fetchProject();
          }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!project)
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Project not found.
      </div>
    );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProjectKanbanWorkspace
        project={project}
        projectId={String(id)}
        currentUserId={user?.id || ''}
        currentUserName={user?.username || 'You'}
        showChat={showChat}
        unreadNotifications={unreadNotifications}
        activeTask={activeTask}
        tasks={tasks}
        onBack={() => router.push('/projects')}
        onChatToggle={handleChatToggle}
        onGenerateProjectPdf={handleGenerateProjectPdf}
        onAddTask={openTaskModal}
        onDeleteTask={handleDeleteTask}
        onTaskClick={setViewingTask}
        onMoveTaskStatus={handleMoveTaskStatus}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      <CreateTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        newTask={newTask}
        setNewTask={setNewTask}
        project={project}
        creating={creating}
      />
      <TaskDetailsModal
        task={viewingTask}
        project={project}
        onClose={() => setViewingTask(null)}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
        uploading={uploading}
        uploadError={uploadError}
        onClearUploadError={() => setUploadError(null)}
        onUploadAttachment={handleFileUpload}
      />
    </div>
  );
}
