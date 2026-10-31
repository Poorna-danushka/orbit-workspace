import Link from 'next/link';
import type { FormEvent } from 'react';
import { ArrowRight, FolderKanban, Loader2, X, Zap } from 'lucide-react';
import type { Project } from '@/features/projects/types';
import { ROUTES } from '@/lib/constants/routes';

interface DashboardQuickAddModel {
  projects: Project[];
  showQuickAdd: boolean;
  onCloseQuickAdd: () => void;
  onQuickAddSubmit: (event: FormEvent<HTMLFormElement>) => void;
  quickForm: {
    title: string;
    projectId: string;
    priority: string;
    dueDate: string;
  };
  onQuickAddChange: (field: 'title' | 'projectId' | 'priority' | 'dueDate', value: string) => void;
  formError: string;
  submitting: boolean;
}

export default function DashboardQuickAdd({ model }: { model: DashboardQuickAddModel }) {
  const {
    projects,
    showQuickAdd,
    onCloseQuickAdd,
    onQuickAddSubmit,
    quickForm,
    onQuickAddChange,
    formError,
    submitting,
  } = model;
  return (
    <>
      {showQuickAdd && (
        <div
          className="member-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseQuickAdd();
          }}
        >
          <section
            className="member-quick-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
          >
            <header>
              <div>
                <span className="member-panel-kicker">Keep the momentum</span>
                <h2 id="quick-add-title">Create a task</h2>
              </div>
              <button type="button" onClick={onCloseQuickAdd} aria-label="Close create task dialog">
                <X size={18} />
              </button>
            </header>
            {projects.length ? (
              <form onSubmit={onQuickAddSubmit} className="member-quick-form">
                <label>
                  Task name
                  <input
                    value={quickForm.title}
                    onChange={(event) => onQuickAddChange('title', event.target.value)}
                    placeholder="What needs to get done?"
                    maxLength={120}
                    required
                    autoFocus
                  />
                </label>
                <label>
                  Project
                  <select
                    value={quickForm.projectId}
                    onChange={(event) => onQuickAddChange('projectId', event.target.value)}
                    required
                  >
                    <option value="">Choose a project</option>
                    {projects.map((project) => (
                      <option value={project.id} key={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="member-quick-form-row">
                  <label>
                    Priority
                    <select
                      value={quickForm.priority}
                      onChange={(event) => onQuickAddChange('priority', event.target.value)}
                    >
                      {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                        <option value={priority} key={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Due date
                    <input
                      type="date"
                      value={quickForm.dueDate}
                      onChange={(event) => onQuickAddChange('dueDate', event.target.value)}
                    />
                  </label>
                </div>
                {formError && (
                  <p className="member-dashboard-error" role="alert">
                    {formError}
                  </p>
                )}
                <button
                  className="member-primary-button"
                  type="submit"
                  disabled={submitting || !quickForm.title.trim() || !quickForm.projectId}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {submitting ? 'Creating…' : 'Create task'}
                </button>
              </form>
            ) : (
              <div className="member-dashboard-empty">
                <FolderKanban size={24} />
                <strong>Create a project first</strong>
                <span>Tasks need a project to live in.</span>
                <Link href={ROUTES.projects} className="member-primary-button">
                  Go to projects <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
