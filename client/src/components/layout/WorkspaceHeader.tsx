'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronRight, Menu } from 'lucide-react';
import api from '@/lib/axios';
import Avatar from '@/components/common/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface SearchResult {
  projects: { id: string; title: string; description: string | null }[];
  tasks: { id: string; title: string; projectId: string; status: string; project?: { title: string } }[];
}

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

export default function WorkspaceHeader({ user, unreadCount, onMenuOpen, pageName }: WorkspaceHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); };

  const handleSearchChange = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults(null); return; }
    try {
      const res = await api.get<SearchResult>(`/search?q=${q}`);
      setSearchResults(res.data);
    } catch {}
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex h-[60px] flex-shrink-0 items-center gap-4 px-6
                         bg-[#0d0f16]/85 backdrop-blur-md border-b border-white/[0.08] z-30">
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
              onChange={e => handleSearchChange(e.target.value)}
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
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-1">Projects</p>
                        {searchResults.projects.map(p => (
                          <Link key={p.id} href={`/projects/${p.id}`} onClick={closeSearch}
                            className="block px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
                            <p className="text-sm text-purple-400 font-medium">{p.title}</p>
                            {p.description && <p className="text-xs text-gray-500 truncate">{p.description}</p>}
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.tasks.length > 0 && (
                      <div className="p-2 border-t border-white/[0.06]">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-1">Tasks</p>
                        {searchResults.tasks.map(t => (
                          <Link key={t.id} href={`/projects/${t.projectId}`} onClick={closeSearch}
                            className="block px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
                            <p className="text-sm font-medium text-white">{t.title}</p>
                            <p className="text-xs text-gray-500">{t.project?.title} · {t.status}</p>
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

          <Link href="/notifications"
            className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            )}
          </Link>
          <Link href="/profile" className="flex-shrink-0 ml-1">
            <Avatar user={user} size="sm" className="ring-2 ring-purple-500/30 hover:ring-purple-500/60 hover:shadow-[0_0_14px_rgba(139,92,246,0.4)] transition-all" />
          </Link>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 z-50 flex items-center px-3 gap-2
                      bg-[#0d0d0d] border-b border-white/[0.07]">
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

        <Link href="/notifications"
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          )}
        </Link>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
             onClick={e => { if (e.target === e.currentTarget) closeSearch(); }}>
          <div className="bg-[#111] border-b border-white/10 p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks, projects…"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                           text-sm text-white placeholder:text-gray-600
                           focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
              />
            </div>
            <button onClick={closeSearch} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
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
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Projects</p>
                      {searchResults.projects.map(p => (
                        <Link key={p.id} href={`/projects/${p.id}`} onClick={closeSearch}
                          className="block px-3 py-3 hover:bg-white/5 rounded-xl transition-colors">
                          <p className="text-sm text-purple-400 font-medium">{p.title}</p>
                          {p.description && <p className="text-xs text-gray-500 truncate">{p.description}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-3 border-t border-white/[0.06]">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Tasks</p>
                      {searchResults.tasks.map(t => (
                        <Link key={t.id} href={`/projects/${t.projectId}`} onClick={closeSearch}
                          className="block px-3 py-3 hover:bg-white/5 rounded-xl transition-colors">
                          <p className="text-sm font-medium text-white">{t.title}</p>
                          <p className="text-xs text-gray-500">{t.project?.title} · {t.status}</p>
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
