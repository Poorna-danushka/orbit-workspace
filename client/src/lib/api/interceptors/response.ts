import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { getCsrfToken } from '../csrf';
import { decideAuthAction } from '../auth-policy';
import { refreshSession } from '../refresh';
import type { ApiError } from '@/lib/errors';
import { normalizeError } from '@/lib/errors';
import { endSession } from '@/lib/auth/session';
import type { OrbitRequestConfig } from '../types';

function attachApiError(error: unknown): Error & { apiError: ApiError } {
  const apiError = normalizeError(error);
  if (axios.isAxiosError(error)) {
    return Object.assign(error, { apiError });
  }
  if (error instanceof Error) return Object.assign(error, { apiError });
  return Object.assign(new Error(apiError.message), { apiError });
}

function getRetryAfterDelay(error: AxiosError): number | undefined {
  const header = error.response?.headers?.['Retry-After'] ?? error.response?.headers?.['retry-after'];
  if (typeof header !== 'string' || !header.trim()) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

function wait(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function registerResponseInterceptor(api: AxiosInstance): void {
  api.interceptors.response.use(
    (response) => response,
    async (reason: unknown) => {
      const error = axios.isAxiosError(reason) ? reason : undefined;
      const request = error?.config as OrbitRequestConfig | undefined;
      const annotatedError = attachApiError(reason);
      if (!error) return Promise.reject(annotatedError);

      const action = decideAuthAction(error, request);
      if (action === 'end-session') {
        endSession('session-ended');
        return Promise.reject(annotatedError);
      }

      if (action === 'retry-csrf' && request && !request._csrfRetry) {
        request._csrfRetry = true;
        const csrfToken = await getCsrfToken(true);
        if (csrfToken) {
          request.headers.set('X-CSRF-Token', csrfToken);
          return api(request);
        }
        return Promise.reject(annotatedError);
      }

      if (action === 'refresh' && request && !request._retry) {
        request._retry = true;
        try {
          await refreshSession(api);
          return api(request);
        } catch (refreshError) {
          return Promise.reject(attachApiError(refreshError));
        }
      }

      if (
        error.response?.status === 429 &&
        request?.method?.toUpperCase() === 'GET' &&
        !request._rateLimitRetry &&
        !request.noRetry
      ) {
        const delay = getRetryAfterDelay(error);
        if (delay !== undefined) {
          request._rateLimitRetry = true;
          await wait(delay);
          return api(request);
        }
      }

      return Promise.reject(annotatedError);
    },
  );
}
