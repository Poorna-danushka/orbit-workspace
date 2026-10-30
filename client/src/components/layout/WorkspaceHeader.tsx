'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronRight, Menu } from 'lucide-react';
import WorkspaceSearchOverlay from './WorkspaceSearchOverlay';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { notifyError } from '@/lib/errors';
import { searchWorkspace } from '@/features/search/services/searchService';
import type { WorkspaceSearchResult } from '@/features/search/types';
import { ROUTES } from '@/lib/constants/routes';

interface WorkspaceHeaderUser {
  username: string;
  email: string;
  avatar?: string | null;
}

interface WorkspaceHeaderProps {
  user: WorkspaceHeaderUser | null;
  unreadCount: number;
  onMenuOpen: () => void;
  pageName: string;
}

export default function WorkspaceHeader({
  user,
  unreadCount,
  onMenuOpen,
  pageName,
}: WorkspaceHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WorkspaceSearchResult | null>(null);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleSearchChange = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await searchWorkspace(q);
      setSearchResults(res.data);
    } catch (error: unknown) {
      notifyError(error, 'Search is temporarily unavailable.');
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header
        className="hidden md:flex h-[60px] flex-shrink-0 items-center gap-4 px-6
                         bg-[#0d0f16]/85 backdrop-blur-md border-b border-white/[0.08] z-30"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
          <span className="text-gray-600">Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
          <span className="font-semibold text-white">{pageName}</span>
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, projects…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white
                         bg-white/[0.04] border border-white/[0.08]
                         placeholder:text-gray-600
                         focus:outline-none focus:ring-2 focus:ring-purple-500/30
                         focus:border-purple-500/40 transition-all"
            />
            {searchOpen && searchResults && (
              <div className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                {searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No results found</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.projects.length > 0 && (
                      <div className="p-2">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-1">
                          Projects
                        </p>
                        {searchResults.projects.map((p) => (
                          <Link
                            key={p.id}
                            href={ROUTES.project(p.id)}
                            onClick={closeSearch}
                            className="block px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
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
                      <div className="p-2 border-t border-white/[0.06]">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-1">
                          Tasks
                        </p>
                        {searchResults.tasks.map((t) => (
                          <Link
                            key={t.id}
                            href={ROUTES.project(t.projectId)}
                            onClick={closeSearch}
                            className="block px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <p className="text-sm font-medium text-white">{t.title}</p>
                            <p className="text-xs text-gray-500">
                              {t.project?.title} · {t.status}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme toggle (light / dark) */}
          <div className="hidden md:block">
            {/* lazy client-only toggle component */}
            {/* ThemeToggle renders a button */}
            <ThemeToggle compact />
          </div>

          <Link
            href={ROUTES.notifications}
            className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            )}
          </Link>
          <Link href={ROUTES.profile} className="flex-shrink-0 ml-1">
            <Avatar
              user={user}
              size="sm"
              className="ring-2 ring-purple-500/30 hover:ring-purple-500/60 hover:shadow-[0_0_14px_rgba(139,92,246,0.4)] transition-all"
            />
          </Link>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <div
        className="md:hidden fixed top-0 inset-x-0 h-14 z-50 flex items-center px-3 gap-2
                      bg-[#0d0d0d] border-b border-white/[0.07]"
      >
        <button
          onClick={onMenuOpen}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-[0_0_14px_rgba(139,92,246,0.4)]">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Orbit
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <Link
          href={ROUTES.notifications}
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          )}
        </Link>
      </div>

      <WorkspaceSearchOverlay
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchChange={handleSearchChange}
        onClose={closeSearch}
      />
    </>
  );
}
