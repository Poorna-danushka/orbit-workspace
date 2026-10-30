import { Loader2, Shield, UserX, Users, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import Avatar from '@/components/ui/Avatar';
import type { Project } from '@/types/project';
import type { ProjectMemberSearchResult } from '@/features/projects/types';

interface ProjectTeamModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  inviteEmail: string;
  setInviteEmail: Dispatch<SetStateAction<string>>;
  inviteMessage: string | null;
  inviteError: string | null;
  searchResults: ProjectMemberSearchResult[];
  searching: boolean;
  inviting: boolean;
  onInviteEmail: (email: string) => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

export default function ProjectTeamModal({
  open,
  project,
  onClose,
  searchQuery,
  setSearchQuery,
  inviteEmail,
  setInviteEmail,
  inviteMessage,
  inviteError,
  searchResults,
  searching,
  inviting,
  onInviteEmail,
  onAddMember,
  onRemoveMember,
}: ProjectTeamModalProps) {
  return (
    <>
      {/* Team Management Modal */}
      {open && project && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => onClose()}
        >
          <div
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Manage Team
              </h3>
              <button
                onClick={() => onClose()}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search input */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Search Users by Username or Email
                </label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Type username or email..."
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim().length > 0 && (
                <div className="bg-white/5 rounded-2xl p-2 border border-white/5 max-h-40 overflow-y-auto">
                  {searching ? (
                    <div className="flex items-center justify-center py-4 text-xs text-gray-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-2">
                      <div className="text-center py-2 text-xs text-gray-500">No users found.</div>

                      {/* Invite by email when no users found */}
                      <div className="flex gap-2 items-center mt-2">
                        <input
                          value={inviteEmail || searchQuery}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="Enter email to invite"
                        />
                        <button
                          onClick={() => onInviteEmail(inviteEmail || searchQuery)}
                          disabled={inviting}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold"
                        >
                          {inviting ? 'Inviting...' : `Invite`}
                        </button>
                      </div>

                      {inviteMessage && (
                        <p className="text-xs text-green-400 mt-2">{inviteMessage}</p>
                      )}
                      {inviteError && <p className="text-xs text-red-400 mt-2">{inviteError}</p>}
                    </div>
                  ) : (
                    searchResults.map((u) => {
                      const isAlreadyMember =
                        project.members?.some((m) => m.userId === u.id) ||
                        project.owner?.id === u.id;
                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar user={u} size="sm" className="w-8 h-8" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate text-white">
                                {u.username}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                          {isAlreadyMember ? (
                            <span className="text-[10px] px-2.5 py-1 bg-white/10 rounded-lg text-gray-400 font-medium">
                              {project.owner?.id === u.id ? 'Owner' : 'Member'}
                            </span>
                          ) : (
                            <button
                              onClick={() => onAddMember(u.id)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Active Members list */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Project Roster
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <Avatar user={project.owner} size="sm" className="w-8 h-8" />
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5">
                          {project.owner?.username}{' '}
                          <Shield className="w-3.5 h-3.5 text-yellow-500" />
                        </p>
                        <p className="text-[11px] text-gray-400">{project.owner?.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md font-semibold">
                      Owner
                    </span>
                  </div>

                  {/* Members */}
                  {!project.members || project.members.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
                      No other team members added yet.
                    </div>
                  ) : (
                    project.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar user={m.user} size="sm" className="w-8 h-8" />
                          <div>
                            <p className="text-sm font-semibold text-white">{m.user.username}</p>
                            <p className="text-[11px] text-gray-400">{m.user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveMember(m.user.id)}
                          className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Remove Member"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
