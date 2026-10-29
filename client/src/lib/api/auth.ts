import api from './client';
import { BACKEND_URL } from '../config';
import type { User } from '@/types/user';

export interface AuthResponse {
  message: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const login = (payload: LoginPayload) =>
  api.post<AuthResponse>('/auth/login', payload);
export const register = (payload: RegisterPayload) =>
  api.post<AuthResponse>('/auth/register', payload);
export const logout = () => api.post('/auth/logout');
export const requestPasswordReset = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email });
export const resetPassword = (token: string, newPassword: string) =>
  api.post<{ message: string }>('/auth/reset-password', { token, newPassword });

export const getGoogleOAuthUrl = (nextPath?: string) => {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured');
  }

  const url = new URL('/api/auth/google', BACKEND_URL);
  if (nextPath) url.searchParams.set('next', nextPath);
  return url.toString();
};
