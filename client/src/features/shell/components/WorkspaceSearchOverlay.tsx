'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import type { WorkspaceSearchResult } from '@/features/search/types';
import { ROUTES } from '@/lib/constants/routes';

type Props = {
  searchOpen: boolean;
  searchQuery: string;
  searchResults: WorkspaceSearchResult | null;
  onSearchChange: (value: string) => void;
  onClose: () => void;
};

export default function WorkspaceSearchOverlay({
  searchOpen,
  searchQuery,
  searchResults,
  onSearchChange,
  onClose,
}: Props) {
  return (
    <>
      {searchOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="bg-[#111] border-b border-white/10 p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks, projects…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                           text-sm text-white placeholder:text-gray-600
                           focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
              />
            </div>
            <button
              onClick={onClose}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
          {searchResults && (
            <div className="flex-1 overflow-y-auto bg-[#0e0e0e]">
              {searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">No results found</p>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">
                        Projects
                      </p>
                      {searchResults.projects.map((p) => (
                        <Link
                          key={p.id}
                          href={ROUTES.project(p.id)}
                          onClick={onClose}
                          className="block px-3 py-3 hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <p className="text-sm text-purple-400 font-medium">{p.title}</p>
                          {p.description && (
                            <p className="text-xs text-gray-500 truncate">{p.description}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-3 border-t border-white/[0.06]">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">
                        Tasks
                      </p>
                      {searchResults.tasks.map((t) => (
                        <Link
                          key={t.id}
                          href={ROUTES.project(t.projectId)}
                          onClick={onClose}
                          className="block px-3 py-3 hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <p className="text-sm font-medium text-white">{t.title}</p>
                          <p className="text-xs text-gray-500">
                            {t.project?.title} · {t.status}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
