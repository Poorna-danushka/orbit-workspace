import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getErrorMessage, reportError } from '@/lib/errors';
import {
  addProjectMember,
  getProjects,
  inviteProjectMember,
  removeProjectMember,
  searchProjectMembers,
} from '@/features/projects/services/projectService';
import type { Project } from '@/types/project';
import type { ProjectMemberSearchResult } from '@/features/projects/types';

export default function useProjectTeamManagement(setProjects: Dispatch<SetStateAction<Project[]>>) {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedTeamProject, setSelectedTeamProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ProjectMemberSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delayDebounce = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await searchProjectMembers(searchQuery);
        setSearchResults(response.data);
      } catch (error) {
        reportError(error, 'Failed to search project members');
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => window.clearTimeout(delayDebounce);
  }, [searchQuery]);

  const refreshSelectedProject = useCallback(
    async (projectId: string) => {
      const response = await getProjects();
      const projects = Array.isArray(response.data) ? response.data : (response.data.data ?? []);
      setProjects(projects);
      const selected = projects.find((project) => project.id === projectId);
      if (selected) setSelectedTeamProject(selected);
    },
    [setProjects],
  );

  const openTeamModal = useCallback((project: Project) => {
    setSelectedTeamProject(project);
    setIsTeamModalOpen(true);
  }, []);

  const handleProjectRemoved = useCallback((projectId: string) => {
    setSelectedTeamProject((previous) => {
      if (!previous || previous.id !== projectId) return previous;
      setIsTeamModalOpen(false);
      return null;
    });
  }, []);

  const handleAddMember = useCallback(
    async (targetUserId: string) => {
      if (!selectedTeamProject) return;
      try {
        await addProjectMember(selectedTeamProject.id, targetUserId);
        await refreshSelectedProject(selectedTeamProject.id);
        setSearchQuery('');
      } catch (error) {
        setInviteError(getErrorMessage(error, 'Failed to add member.'));
      }
    },
    [refreshSelectedProject, selectedTeamProject],
  );

  const handleInviteEmail = useCallback(
    async (email: string) => {
      if (!selectedTeamProject) return;
      const trimmed = email.trim();
      if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
        setInviteError('Please provide a valid email address.');
        return;
      }

      try {
        setInviting(true);
        setInviteError(null);
        setInviteMessage(null);
        const response = await inviteProjectMember(selectedTeamProject.id, trimmed);
        setInviteMessage(response.data?.message || 'Invitation sent.');
        await refreshSelectedProject(selectedTeamProject.id);
        setInviteEmail('');
        setSearchQuery('');
      } catch (error) {
        setInviteError(getErrorMessage(error, 'Failed to send invitation.'));
      } finally {
        setInviting(false);
      }
    },
    [refreshSelectedProject, selectedTeamProject],
  );

  const handleRemoveMember = useCallback(
    async (memberUserId: string) => {
      if (!selectedTeamProject) return;
      try {
        await removeProjectMember(selectedTeamProject.id, memberUserId);
        await refreshSelectedProject(selectedTeamProject.id);
      } catch (error) {
        setInviteError(getErrorMessage(error, 'Failed to remove member.'));
      }
    },
    [refreshSelectedProject, selectedTeamProject],
  );

  return {
    isTeamModalOpen,
    setIsTeamModalOpen,
    selectedTeamProject,
    setSelectedTeamProject,
    searchQuery,
    setSearchQuery,
    inviteEmail,
    setInviteEmail,
    inviteMessage,
    inviteError,
    searchResults,
    searching,
    inviting,
    openTeamModal,
    handleProjectRemoved,
    handleAddMember,
    handleInviteEmail,
    handleRemoveMember,
  };
}
