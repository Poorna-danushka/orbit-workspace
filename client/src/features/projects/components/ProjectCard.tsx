'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckSquare,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import type { Project } from '@/features/projects/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: {
    label: 'Active',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-400',
  },
};

/** Stacked avatar row with +N overflow badge */
function AvatarStack({
  members,
  max = 5,
}: {
  members: Array<{ id: string; username: string; avatar: string | null }>;
  max?: number;
}) {
  if (members.length === 0) {
    return (
      <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" /> No members yet
      </span>
    );
  }
  const shown = members.slice(0, max);
  const overflow = members.length - max;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <div key={u.id} className={i > 0 ? '-ml-2' : ''}>
          <Avatar user={u} size="sm" ring />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-2 w-7 h-7 rounded-full bg-white/10 ring-2 ring-[#0d0d14] flex items-center justify-center text-[9px] font-bold text-gray-400">
          +{overflow}
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  currentUserId?: string;
  onManageTeam: (project: Project) => void;
  onEdit: (event: React.MouseEvent<HTMLButtonElement>, project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function ProjectCard({
  project,
  currentUserId,
  onManageTeam,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;

  // Build flat member list: owner first, then members
  const allMembers: Array<{ id: string; username: string; avatar: string | null }> = [
    ...(project.owner ? [project.owner] : []),
    ...(project.members?.map((m) => m.user) ?? []),
  ];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col rounded-2xl bg-white/[0.025] border border-white/[0.08] shadow-lg shadow-black/10 hover:border-purple-400/40 hover:bg-white/[0.045] transition-all duration-300 overflow-hidden hover:shadow-purple-500/10 hover:shadow-xl"
    >
      {/* Gradient accent bar on hover */}
      <div className="h-[2px] w-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5 pb-4">
        {/* Top row: folder icon + status + edit/delete */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/15 transition-colors">
              <FolderKanban className="w-5 h-5 text-purple-400" />
            </div>
            {/* Status badge */}
            <span
              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border capitalize flex items-center gap-1.5 ${cfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Edit / Delete / Manage Team – reveal on hover */}
          <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {project.owner?.id === currentUserId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onManageTeam(project);
                }}
                className="p-1.5 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                title="Manage team"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(event) => onEdit(event, project)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
              title="Edit project"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete(project);
              }}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm line-clamp-3 flex-1 leading-relaxed min-h-[3.75rem]">
          {project.description || 'No description. Click to open Kanban board.'}
        </p>
      </div>

      {/* ── Card footer ── */}
      <div className="px-5 py-3.5 border-t border-white/[0.06] flex items-center justify-between gap-3">
        {/* Left: member avatars */}
        <div className="flex items-center gap-2">
          <AvatarStack members={allMembers} max={5} />
          {project.owner?.id === currentUserId && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onManageTeam(project);
              }}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-purple-500/20 border border-dashed border-white/20 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all"
              title="Manage Team"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: task count + date + arrow */}
        <div className="flex items-center gap-3 text-xs text-gray-600 flex-shrink-0">
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            {project._count?.tasks ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <span className="text-gray-700 group-hover:text-purple-400 transition-colors group-hover:translate-x-0.5 duration-150 inline-flex">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
