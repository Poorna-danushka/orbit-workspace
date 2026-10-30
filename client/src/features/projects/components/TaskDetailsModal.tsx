import type { ChangeEvent } from 'react';
import { Download, FileText, Loader2, Paperclip, UploadCloud, X } from 'lucide-react';
import { COLUMNS } from '@/features/tasks/components/KanbanColumn';
import { PRIORITY_COLORS } from '@/features/tasks/components/TaskCard';
import { BACKEND_URL } from '@/lib/config';
import RemoteImage from '@/components/ui/RemoteImage';
import type { Project } from '@/features/projects/types';
import type { Task } from '@/features/tasks/types';

interface TaskDetailsModalProps {
  task: Task | null;
  project: Project;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onAssigneeChange: (userId: string) => void;
  uploading: boolean;
  uploadError: string | null;
  onClearUploadError: () => void;
  onUploadAttachment: (event: ChangeEvent<HTMLInputElement>) => void;
}

const isImage = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) : false;
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-400" />;
  if (ext === 'txt') return <FileText className="w-4 h-4 text-blue-400" />;
  return <Paperclip className="w-4 h-4 text-purple-400" />;
};

export default function TaskDetailsModal({
  task,
  project,
  onClose,
  onStatusChange,
  onAssigneeChange,
  uploading,
  uploadError,
  onClearUploadError,
  onUploadAttachment,
}: TaskDetailsModalProps) {
  if (!task) return null;
  return (
    <>
      {/* Task View/Upload Modal */}
      {task && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => onClose()}
        >
          <div
            className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{task.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border font-medium ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}
                >
                  {task.priority}
                </span>
              </div>
              <button
                onClick={() => onClose()}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {task.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Description</h4>
                  <p className="text-sm text-gray-300 bg-white/5 p-4 rounded-xl">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block font-medium text-gray-500 mb-1">Status</span>
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-semibold"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block font-medium text-gray-500 mb-1">Due Date</span>
                  <div className="px-3 py-2 bg-white/5 rounded-lg text-gray-300 font-semibold">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </div>
                </div>
                <div>
                  <span className="block font-medium text-gray-500 mb-1">Assignee</span>
                  <select
                    value={task.assignedTo || ''}
                    onChange={(e) => onAssigneeChange(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
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

              {/* Attachments Section */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-purple-400" /> Attachments
                  </h4>
                  <div>
                    {/* accept restricts the OS file picker to allowed types */}
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      disabled={uploading}
                      accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={onUploadAttachment}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-colors ${
                        uploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      {uploading ? 'Uploading…' : 'Upload File'}
                    </label>
                  </div>
                </div>

                {/* Upload error banner */}
                {uploadError && (
                  <div className="mb-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                    <X
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 cursor-pointer hover:text-red-200"
                      onClick={() => onClearUploadError}
                    />
                    <span>{uploadError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {!task.attachments || task.attachments.length === 0 ? (
                    <div className="col-span-full text-center py-6 border border-dashed border-white/10 rounded-xl text-gray-500 text-sm">
                      No attachments yet. Upload a file above.
                    </div>
                  ) : (
                    task.attachments.map((att) => {
                      const image = isImage(att.fileName);
                      return (
                        <div
                          key={att.id}
                          className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 overflow-hidden hover:bg-white/10 transition-colors group"
                        >
                          {image && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/5">
                              <RemoteImage
                                src={`${BACKEND_URL}${att.fileUrl}`}
                                alt={att.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="p-1.5 bg-white/5 rounded-lg flex-shrink-0">
                                {getFileIcon(att.fileName)}
                              </div>
                              <span
                                className="text-xs font-medium truncate text-gray-300"
                                title={att.fileName}
                              >
                                {att.fileName}
                              </span>
                            </div>
                            <a
                              href={`${BACKEND_URL}${att.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
