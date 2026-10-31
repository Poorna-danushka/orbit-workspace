import api from '@/lib/api/client';
import type { NotificationItem } from '../types';

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>('/notifications');
  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const notifications = await getNotifications();
  return notifications.filter((notification) => !notification.isRead).length;
}

export const markNotificationRead = (notificationId: string) =>
  api.patch(`/notifications/${notificationId}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/mark-all-read');
