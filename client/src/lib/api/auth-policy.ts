import type { AxiosError } from 'axios';
import type { OrbitRequestConfig } from './types';

type AuthDecision = 'refresh' | 'end-session' | 'pass-through' | 'retry-csrf';

const AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/csrf-token',
]);

function getRequestPath(url: string | undefined, baseURL: string | undefined): string {
  if (!url) return '';
  try {
    const path = new URL(url, baseURL).pathname;
    return path.replace(/^\/api(?=\/)/, '').replace(/\/+$/, '') || '/';
  } catch {
    return url.split('?')[0];
  }
}

export function decideAuthAction(
  error: AxiosError | unknown,
  requestConfig?: OrbitRequestConfig,
): AuthDecision {
  if (!error || typeof error !== 'object') return 'pass-through';

  const axiosError = error as AxiosError<{ code?: unknown }>;
  const status = axiosError.response?.status;
  const responseCode = axiosError.response?.data?.code;
  const code = typeof responseCode === 'string' ? responseCode : '';
  const requestPath = getRequestPath(requestConfig?.url, requestConfig?.baseURL);

  if (status === 403 && code === 'CSRF_INVALID') {
    return 'retry-csrf';
  }

  if (status !== 401) return 'pass-through';
  if (code === 'AUTH_TOKEN_INVALID' || code === 'AUTH_USER_NOT_FOUND' || code.startsWith('AUTH_REFRESH_')) {
    return 'end-session';
  }
  if (requestConfig?.skipAuthRefresh || AUTH_ENDPOINTS.has(requestPath)) return 'pass-through';
  if (code === 'AUTH_TOKEN_EXPIRED' || code === 'AUTH_TOKEN_MISSING') return 'refresh';

  return 'pass-through';
}
