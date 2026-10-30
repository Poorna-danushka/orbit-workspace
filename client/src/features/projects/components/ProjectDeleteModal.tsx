import { Loader2, Trash2 } from 'lucide-react';
import type { Project } from '@/types/project';

interface ProjectDeleteModalProps {
  project: Project | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: (project: Project) => void;
}

export default function ProjectDeleteModal({
  project,
  deleting,
  onCancel,
  onConfirm,
}: ProjectDeleteModalProps) {
  if (!project) return null;
  return (
    <>
      {/* ── Delete Confirm Modal ── */}
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#111] border border-red-500/20 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Delete Project</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              Delete <strong className="text-white">&quot;{project.title}&quot;</strong>? All{' '}
              {project._count?.tasks ?? 0} task
              {(project._count?.tasks ?? 0) !== 1 ? 's' : ''} inside will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onCancel()}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(project)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
