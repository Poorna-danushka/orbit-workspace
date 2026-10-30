'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { acquireSocket, releaseSocket } from '@/lib/realtime/socket';
import { getErrorMessage, reportError } from '@/lib/errors';
import type { Project } from '@/features/projects/types';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/features/projects/services/projectService';
import ProjectTeamModal from './ProjectTeamModal';
import ProjectFormModal from './ProjectFormModal';
import ProjectDeleteModal from './ProjectDeleteModal';
import ProjectListSummary from './ProjectListSummary';
import ProjectGrid from './ProjectGrid';
import useProjectTeamManagement from '../hooks/useProjectTeamManagement';
import { useAsyncResource } from '@/hooks/useAsyncResource';

export default function Projects() {
  const { user } = useSelector((state: RootState) => state.auth);

  const loadProjectResource = useCallback(async () => {
    const res = await getProjects();
    return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
  }, []);
  const projectResource = useAsyncResource<Project[]>(loadProjectResource);
  const projects = projectResource.data ?? [];
  const loading = projectResource.loading;
  const loadError = projectResource.error
    ? getErrorMessage(projectResource.error, 'Unable to load your projects.')
    : null;
  const setProjects = projectResource.setData;
  const fetchProjects = projectResource.reload;
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const team = useProjectTeamManagement(setProjects);
  const { handleProjectRemoved } = team;

  useEffect(() => {
    if (!user) return;
    const socket = acquireSocket();
    socket.emit('joinUser', user.id);

    const onProjectAdded = () => void fetchProjects();
    const onProjectRemoved = (data: { projectId: string }) => {
      void fetchProjects();
      handleProjectRemoved(data.projectId);
    };

    socket.on('projectAdded', onProjectAdded);
    socket.on('projectRemoved', onProjectRemoved);

    return () => {
      socket.off('projectAdded', onProjectAdded);
      socket.off('projectRemoved', onProjectRemoved);
      releaseSocket();
    };
  }, [user, fetchProjects, handleProjectRemoved]);

  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditProject(null);
    setFormError(null);
    setForm({ title: '', description: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditProject(project);
    setFormError(null);
    setForm({
      title: project.title,
      description: project.description || '',
      status: project.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editProject) {
        await updateProject(editProject.id, form);
        setProjects((prev) => (prev ?? []).map((p) => (p.id === editProject.id ? { ...p, ...form } : p)));
      } else {
        const res = await createProject(form);
        setProjects((prev) => [res.data, ...(prev ?? [])]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to save project.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project: Project) => {
    setDeleteId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((prev) => (prev ?? []).filter((p) => p.id !== project.id));
      setConfirmDelete(null);
    } catch (err) {
      reportError(err, 'Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const totalTasks = projects.reduce((sum, project) => sum + (project._count?.tasks || 0), 0);

  if (loading && projects.length === 0)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProjectListSummary
        loadError={loadError}
        projectCount={projects.length}
        activeCount={activeCount}
        totalTasks={totalTasks}
        search={search}
        setSearch={setSearch}
        onCreate={openCreate}
        onRetry={() => {
          void fetchProjects();
        }}
      />

      <ProjectGrid
        loadError={loadError}
        projectCount={projects.length}
        filteredProjects={filtered}
        loading={loading}
        search={search}
        currentUserId={user?.id}
        onCreate={openCreate}
        onManageTeam={team.openTeamModal}
        onEdit={openEdit}
        onDelete={setConfirmDelete}
      />

      <ProjectFormModal
        open={isModalOpen}
        editProject={editProject}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        formError={formError}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      <ProjectDeleteModal
        project={confirmDelete}
        deleting={deleteId === confirmDelete?.id}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
      <ProjectTeamModal
        open={team.isTeamModalOpen}
        project={team.selectedTeamProject}
        onClose={() => team.setIsTeamModalOpen(false)}
        searchQuery={team.searchQuery}
        setSearchQuery={team.setSearchQuery}
        inviteEmail={team.inviteEmail}
        setInviteEmail={team.setInviteEmail}
        inviteMessage={team.inviteMessage}
        inviteError={team.inviteError}
        searchResults={team.searchResults}
        searching={team.searching}
        inviting={team.inviting}
        onInviteEmail={team.handleInviteEmail}
        onAddMember={team.handleAddMember}
        onRemoveMember={team.handleRemoveMember}
      />
    </div>
  );
}
