import { FolderKanban, Plus } from 'lucide-react';
import type { Project } from '@/features/projects/types';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  loadError: string | null;
  projectCount: number;
  filteredProjects: Project[];
  loading: boolean;
  search: string;
  currentUserId?: string;
  onCreate: () => void;
  onManageTeam: (project: Project) => void;
  onEdit: (event: React.MouseEvent<HTMLButtonElement>, project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function ProjectGrid({
  loadError,
  projectCount,
  filteredProjects,
  loading,
  search,
  currentUserId,
  onCreate,
  onManageTeam,
  onEdit,
  onDelete,
}: ProjectGridProps) {
  return (
    <>
      {/* ── Grid ── */}
      {loadError && projectCount === 0 ? null : filteredProjects.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5">
            <FolderKanban className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {search ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-gray-500 text-sm max-w-xs text-center mb-6">
            {search
              ? 'Try a different search term.'
              : 'Create your first project to start organising tasks with a Kanban board.'}
          </p>
          {!search && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Get started
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
              onManageTeam={onManageTeam}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
