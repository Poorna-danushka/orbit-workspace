import api from '../axios';
import { BACKEND_URL } from '../config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const login = (payload: LoginPayload) => api.post('/auth/login', payload);
export const register = (payload: RegisterPayload) => api.post('/auth/register', payload);
export const refresh = () => api.post('/auth/refresh');
export const logout = () => api.post('/auth/logout');

export const getGoogleOAuthUrl = (nextPath?: string) => {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured');
  }

  const url = new URL('/api/auth/google', BACKEND_URL);
  if (nextPath) url.searchParams.set('next', nextPath);
  return url.toString();
};
