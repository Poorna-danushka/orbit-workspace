'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/lib/constants/routes';
import { Loader2 } from 'lucide-react';
import type { Task } from '@/features/tasks/types';
import ProjectKanbanWorkspace from './ProjectKanbanWorkspace';
import useProjectTaskActions from '../hooks/useProjectTaskActions';
import { generateProjectPdf } from '@/features/projects/services/projectReportService';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import useProjectDetailData from '../hooks/useProjectDetailData';

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const {
    project,
    tasks,
    setTasks,
    loading,
    setLoading,
    loadError,
    fetchProject,
    showChat,
    unreadNotifications,
    handleChatToggle,
  } = useProjectDetailData(String(id), setViewingTask);
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

  const [uploading, setUploading] = useState(false);
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
        onBack={() => router.push(ROUTES.projects)}
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
