import Link from 'next/link';
import { ArrowRight, FolderKanban } from 'lucide-react';
import type { Project } from '@/features/projects/types';
import { ROUTES } from '@/lib/constants/routes';

interface DashboardProjectsProps {
  projects: Project[];
  loading: boolean;
}

export default function DashboardProjects({ projects, loading }: DashboardProjectsProps) {
  return (
    <section className="member-projects-strip">
      <div className="member-projects-copy">
        <span className="member-panel-icon">
          <FolderKanban size={18} />
        </span>
        <div>
          <span className="member-panel-kicker">In your orbit</span>
          <h2>Your projects</h2>
          <p>
            {projects.length} project{projects.length === 1 ? '' : 's'} you own or collaborate on
          </p>
        </div>
      </div>
      <div className="member-project-chips">
        {projects.slice(0, 4).map((project) => (
          <Link href={ROUTES.project(project.id)} key={project.id} className="member-project-chip">
            <span>{project.title}</span>
            <ArrowRight size={14} />
          </Link>
        ))}
        {!projects.length && !loading && (
          <span className="member-no-projects">No projects yet</span>
        )}
      </div>
      <Link href={ROUTES.projects} className="member-projects-link">
        Browse projects <ArrowRight size={15} />
      </Link>
    </section>
  );
}
