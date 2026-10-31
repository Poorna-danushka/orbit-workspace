import api from '@/lib/api/client';
import type { User } from '@/types/user';

export const updateProfile = (payload: { username: string }) =>
  api.patch<{ message: string; user: User }>('/user/profile', payload);
export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  api.patch<{ message: string }>('/user/change-password', payload);
export const uploadAvatar = (formData: FormData) =>
  api.post<{ message: string; user: User }>('/user/avatar', formData);
