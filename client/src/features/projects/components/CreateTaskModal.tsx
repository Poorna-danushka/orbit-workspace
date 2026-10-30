import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Loader2, X } from 'lucide-react';
import { COLUMNS } from '@/features/tasks/components/KanbanColumn';
import type { Project } from '@/types/project';

export interface NewTaskForm {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  status: string;
  assignedTo: string;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  newTask: NewTaskForm;
  setNewTask: Dispatch<SetStateAction<NewTaskForm>>;
  project: Project;
  creating: boolean;
}

export default function CreateTaskModal({
  open,
  onClose,
  onSubmit,
  newTask,
  setNewTask,
  project,
  creating,
}: CreateTaskModalProps) {
  if (!open) return null;
  return (
    <>
      {/* Task Create Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">New Task</h3>
              <button
                onClick={() => onClose()}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-sm text-gray-400 mb-1.5">
                  Task Title *
                </label>
                <input
                  id="task-title"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="e.g. Fix login bug"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Task details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Assignee</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask((p) => ({ ...p, assignedTo: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Unassigned</option>
                    {project.owner && (
                      <option value={project.owner.id}>{project.owner.username} (Owner)</option>
                    )}
                    {project.members
                      ?.filter((m) => m.userId !== project.ownerId)
                      .map((m) => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.username}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
