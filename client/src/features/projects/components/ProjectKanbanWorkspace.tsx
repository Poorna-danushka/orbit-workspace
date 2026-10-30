import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Project } from '@/features/projects/types';
import type { Task } from '@/features/tasks/types';
import KanbanColumn, { COLUMNS } from '@/features/tasks/components/KanbanColumn';
import ProjectChat from '@/features/chat/components/ProjectChat';

interface ProjectKanbanWorkspaceProps {
  project: Project;
  projectId: string;
  currentUserId: string;
  currentUserName: string;
  showChat: boolean;
  unreadNotifications: number;
  activeTask: Task | null;
  tasks: Task[];
  onBack: () => void;
  onChatToggle: () => void;
  onGenerateProjectPdf: () => void;
  onAddTask: (status: string) => void;
  onDeleteTask: (taskId: string, event: React.MouseEvent) => void;
  onTaskClick: (task: Task) => void;
  onMoveTaskStatus: (taskId: string, status: string) => void;
  onDragStart: (event: import('@dnd-kit/core').DragStartEvent) => void;
  onDragEnd: (event: import('@dnd-kit/core').DragEndEvent) => void;
}

export default function ProjectKanbanWorkspace({
  project,
  projectId,
  currentUserId,
  currentUserName,
  showChat,
  unreadNotifications,
  activeTask,
  tasks,
  onBack,
  onChatToggle,
  onGenerateProjectPdf,
  onAddTask,
  onDeleteTask,
  onTaskClick,
  onMoveTaskStatus,
  onDragStart,
  onDragEnd,
}: ProjectKanbanWorkspaceProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isOwner = project.ownerId === currentUserId;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{project.title}</h2>
            {project.description && (
              <p className="text-gray-400 text-sm mt-1">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <ProjectChat
              projectId={projectId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              open={showChat}
              onToggle={onChatToggle}
            />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-white/10 bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={onGenerateProjectPdf}
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              title="Create project PDF"
            >
              <span className="text-sm font-medium">Create PDF</span>
            </button>
          )}
          <button
            aria-label="New Task"
            onClick={() => onAddTask('Todo')}
            className="group relative flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-[0_0_15px_rgba(120,119,198,0.25)] hover:shadow-[0_0_22px_rgba(120,119,198,0.45)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden"
            title="Create a new task (HotKey: N)"
          >
            {/* Sheen effect overlay */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <Plus className="w-4.5 h-4.5 text-white/90 group-hover:rotate-90 transition-transform duration-300 ease-out" />
            <span className="text-sm tracking-wide">New Task</span>
            <kbd
              aria-hidden="true"
              className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 ml-1.5 text-[9px] font-bold text-white/50 bg-white/10 border border-white/10 rounded-md"
            >
              N
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 h-full min-h-[500px]">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col}
                status={col}
                tasks={tasks.filter((task) => task.status === col)}
                onDelete={onDeleteTask}
                onAddTask={onAddTask}
                onTaskClick={onTaskClick}
                onMoveForward={onMoveTaskStatus}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="p-4 rounded-xl bg-[#1a1a2e] border border-purple-500/30 shadow-2xl rotate-2 opacity-90">
                <p className="text-sm font-medium">{activeTask.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}
