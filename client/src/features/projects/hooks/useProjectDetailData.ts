'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { acquireSocket, releaseSocket } from '@/lib/realtime/socket';
import { getErrorMessage } from '@/lib/errors';
import { getProject, getProjectTasks } from '@/features/projects/services/projectService';
import { getTaskAttachments } from '@/features/tasks/services/taskService';
import {
  getNotifications,
  markAllNotificationsRead,
} from '@/features/notifications/services/notificationService';
import type { Project, ProjectMember } from '@/features/projects/types';
import type { Task } from '@/features/tasks/types';
import { reportError } from '@/lib/errors';

export default function useProjectDetailData(
  projectId: string,
  setViewingTask: Dispatch<SetStateAction<Task | null>>,
) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      setUnreadNotifications(notifications.filter((item) => !item.isRead).length);
    } catch (error) {
      reportError(error, 'Failed to fetch project notifications');
    }
  }, []);

  const fetchProject = useCallback(async () => {
    setLoadError(null);
    try {
      const [projectResponse, taskResponse] = await Promise.all([
        getProject(projectId),
        getProjectTasks(projectId),
      ]);
      setProject(projectResponse.data);

      const tasksWithAttachments = await Promise.all(
        taskResponse.data.map(async (task: Task) => {
          const attachmentResponse = await getTaskAttachments(task.id);
          return { ...task, attachments: attachmentResponse.data };
        }),
      );
      setTasks(tasksWithAttachments);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load this project.'));
      reportError(error, 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const socket = acquireSocket();
    const onTaskChanged = (data: { taskId: string; status: string }) => {
      setTasks((previous) =>
        previous.map((task) => (task.id === data.taskId ? { ...task, status: data.status } : task)),
      );
    };
    const onNotificationReceived = () => void fetchUnreadNotifications();
    const onMemberAdded = (newMember: ProjectMember) => {
      setProject((previous) => {
        if (!previous) return null;
        const members = previous.members ?? [];
        if (members.some((member) => member.id === newMember.id)) return previous;
        return { ...previous, members: [...members, newMember] };
      });
    };
    const onMemberRemoved = (data: { projectId: string; userId: string }) => {
      setProject((previous) => {
        if (!previous) return null;
        return {
          ...previous,
          members: (previous.members ?? []).filter((member) => member.userId !== data.userId),
        };
      });
      setTasks((previous) =>
        previous.map((task) =>
          task.assignedTo === data.userId ? { ...task, assignedTo: null, assignee: null } : task,
        ),
      );
      setViewingTask((previous) =>
        previous?.assignedTo === data.userId
          ? { ...previous, assignedTo: null, assignee: null }
          : previous,
      );
    };

    socket.emit('joinProject', projectId);
    socket.on('taskChanged', onTaskChanged);
    socket.on('notificationReceived', onNotificationReceived);
    socket.on('memberAdded', onMemberAdded);
    socket.on('memberRemoved', onMemberRemoved);
    void Promise.resolve().then(() => {
      void fetchProject();
      void fetchUnreadNotifications();
    });

    return () => {
      socket.off('taskChanged', onTaskChanged);
      socket.off('notificationReceived', onNotificationReceived);
      socket.off('memberAdded', onMemberAdded);
      socket.off('memberRemoved', onMemberRemoved);
      releaseSocket();
    };
  }, [projectId, fetchProject, fetchUnreadNotifications, setViewingTask]);

  const handleChatToggle = async () => {
    if (!showChat) {
      setUnreadNotifications(0);
      try {
        await markAllNotificationsRead();
      } catch (error) {
        reportError(error, 'Failed to mark project notifications as read');
        void fetchUnreadNotifications();
      }
    }
    setShowChat((previous) => !previous);
  };

  return {
    project,
    setProject,
    tasks,
    setTasks,
    loading,
    setLoading,
    loadError,
    fetchProject,
    showChat,
    setShowChat,
    unreadNotifications,
    setUnreadNotifications,
    fetchUnreadNotifications,
    handleChatToggle,
  };
}
