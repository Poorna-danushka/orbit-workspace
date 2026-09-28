'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckSquare, FolderKanban, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

interface AdminProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  owner: { username: string; email: string };
  _count: { tasks: number };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [confirmDelete, setConfirmDelete] = useState<AdminProject | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/projects');
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (project: AdminProject) => {
    try {
      await api.delete(`/admin/projects/${project.id}`);
      setProjects((prev) => prev.filter((item) => item.id !== project.id));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const q = search.toLowerCase();
    const matchesSearch = project.title.toLowerCase().includes(q) || project.owner?.username?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTasks = projects.reduce((sum, item) => sum + (item._count?.tasks ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="mt-1 text-sm text-gray-500">{projects.length} projects · {totalTasks} total tasks</p>
        </div>
        <button onClick={fetchProjects} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total', value: projects.length, tone: 'text-white' },
          { label: 'Active', value: projects.filter((p) => p.status === 'active').length, tone: 'text-emerald-400' },
          { label: 'Completed', value: projects.filter((p) => p.status === 'completed').length, tone: 'text-blue-400' },
          { label: 'Total Tasks', value: totalTasks, tone: 'text-violet-400' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-[#11131b] p-4">
            <div className="text-3xl font-bold text-white">{item.value}</div>
            <div className="mt-2 text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {['all', 'active', 'completed', 'archived'].map((tab) => (
            <button key={tab} onClick={() => setStatusFilter(tab as 'all' | 'active' | 'completed' | 'archived')} className={`rounded-lg px-3 py-2 text-sm ${statusFilter === tab ? 'bg-red-500/15 text-red-400' : 'text-gray-400'}`}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project name or owner..." className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-red-500/40 focus:outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-400" /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#11131b] p-10 text-center text-gray-500">No projects found.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-white/10 bg-[#11131b] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-500/10 p-2 text-violet-400"><FolderKanban className="h-5 w-5" /></div>
                  <div>
                    <h2 className="font-semibold text-white">{project.title}</h2>
                    <p className="text-sm text-gray-500">Owner: {project.owner?.username}</p>
                  </div>
                </div>
                <button onClick={() => setConfirmDelete(project)} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>

              <p className="mt-4 min-h-[48px] text-sm text-gray-400">{project.description || 'No description provided.'}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Status</div>
                  <div className="mt-2 text-sm text-white">{project.status}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Tasks</div>
                  <div className="mt-2 text-sm text-white">{project._count?.tasks ?? 0}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Created</div>
                  <div className="mt-2 text-sm text-white">{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11131b] p-5">
            <h3 className="text-lg font-semibold text-white">Delete project</h3>
            <p className="mt-2 text-sm text-gray-400">This will permanently delete <span className="font-medium text-white">{confirmDelete.title}</span> and all related tasks. Continue?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
