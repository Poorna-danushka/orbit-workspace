import type { Project } from '@/features/projects/types';

interface ProjectAssigneeSelectProps {
  project: Project;
  value: string;
  onChange: (userId: string) => void;
  density: 'comfortable' | 'compact';
}

export default function ProjectAssigneeSelect({
  project,
  value,
  onChange,
  density,
}: ProjectAssigneeSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={
        density === 'comfortable'
          ? 'w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50'
          : 'w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50'
      }
    >
      <option value="">Unassigned</option>
      {project.owner && <option value={project.owner.id}>{project.owner.username} (Owner)</option>}
      {project.members
        ?.filter((member) => member.userId !== project.ownerId)
        .map((member) => (
          <option key={member.user.id} value={member.user.id}>
            {member.user.username}
          </option>
        ))}
    </select>
  );
}
