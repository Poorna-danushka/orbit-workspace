import type { Dispatch, SetStateAction } from 'react';
import { Plus, Search } from 'lucide-react';

interface ProjectListSummaryProps {
  loadError: string | null;
  projectCount: number;
  activeCount: number;
  totalTasks: number;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  onCreate: () => void;
  onRetry: () => void;
}

export default function ProjectListSummary({
  loadError,
  projectCount,
  activeCount,
  totalTasks,
  search,
  setSearch,
  onCreate,
  onRetry,
}: ProjectListSummaryProps) {
  return (
    <>
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-400 mb-2">
            Workspace overview
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Projects</h2>
          <p className="text-gray-500 text-sm mt-1">Plan, collaborate, and move work forward.</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-900/30 transition-all"
        >
          <Plus className="w-5 h-5" /> <span>New Project</span>
        </button>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-amber-100">{loadError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-xl border border-amber-300/20 px-3 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-300/10"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ['Total projects', projectCount, 'Across your workspace'],
          ['Active now', activeCount, 'Currently in motion'],
          ['Tasks tracked', totalTasks, 'Across all projects'],
        ].map(([label, value, hint]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[11px] text-gray-600">{hint}</p>
          </div>
        ))}
      </div>

      {projectCount > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            aria-label="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or description…"
            className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm"
          />
        </div>
      )}
    </>
  );
}
