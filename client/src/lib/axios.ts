/**
 * Orbit API Client
 *
 * Centralises all HTTP communication with the backend:
 *  - CSRF token fetching (with timeout, deduplication, and graceful fallback)
 *  - Transparent access-token refresh on 401 (with request deduplication)
 *  - Structured, sanitised error logging (never logs request bodies / headers)
 *
 * @module axios
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';
import { saveAuthTokens, clearAuthTokens, getCookie } from './tokenStorage';

// ── Config ───────────────────────────────────────────────────────────────────

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const baseURL   = process.env.NEXT_PUBLIC_API_URL   || `${serverUrl}/api`;

/**
 * Main API client.
 * 30 s timeout to gracefully handle Render / cold-start latency
 * without hanging the browser indefinitely.
 */
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30_000,
});

// ── Type Augmentation ────────────────────────────────────────────────────────

/** Extend Axios config with retry sentinel flags. */
interface OrbitRequestConfig extends InternalAxiosRequestConfig {
  _retry?:     boolean;
  _csrfRetry?: boolean;
}

// ── CSRF Token Management ────────────────────────────────────────────────────

const CSRF_TIMEOUT_MS = 8_000;

let csrfPromise: Promise<string> | null = null;

/**
 * Fetches a fresh CSRF token from the server.
 *
 * Security properties:
 *  - Uses AbortController to enforce an 8 s hard timeout.
 *  - Falls back to any cookie-cached token on error — never throws.
 *  - Uses request deduplication via module-level singleton so concurrent
 *    requests do not hammer the CSRF endpoint.
 */
const getCsrfToken = (): Promise<string> => {
  const cached = getCookie('csrfToken');
  if (cached) return Promise.resolve(cached);

  if (!csrfPromise) {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), CSRF_TIMEOUT_MS);

    csrfPromise = axios
      .get<{ csrfToken: string }>(`${baseURL}/csrf-token`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((response) => response.data?.csrfToken || getCookie('csrfToken') || '')
      // ↓ Never throw — a missing CSRF token should degrade gracefully,
      //   not prevent the user from making any API calls at all.
      .catch(() => getCookie('csrfToken') || '')
      .finally(() => {
        clearTimeout(timeoutId);
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

// ── Request Interceptor ──────────────────────────────────────────────────────

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

api.interceptors.request.use(
  async (config) => {
    // ── Content-Type ──────────────────────────────────────────────────────
    if (config.data instanceof FormData) {
      // Let the browser set multipart/form-data with the correct boundary.
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // ── CSRF Token ────────────────────────────────────────────────────────
    // Only attach for state-mutating methods and only in browser context
    // (Next.js server-side rendering does not use CSRF tokens).
    const method = (config.method ?? 'GET').toUpperCase();
    if (!SAFE_METHODS.has(method) && typeof window !== 'undefined') {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────

let refreshPromise: Promise<unknown> | null = null;

/**
 * Routes that should never trigger a silent token refresh.
 * Stored as a Set for O(1) lookup.
 */
const AUTH_ROUTES = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
]);

/** Strip query-string before matching so `/auth/login?next=/dashboard` still hits the set. */
const isAuthRoute = (url: string | undefined): boolean =>
  !!url && AUTH_ROUTES.has(url.split('?')[0]);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status          = error.response?.status;
    const originalRequest = error.config as OrbitRequestConfig | undefined;
    const serverMessage   = (error.response?.data as Record<string, string> | undefined)?.message;

    // ── Sanitised logging ──────────────────────────────────────────────────
    // Log method + URL only — never log bodies, headers, or tokens.
    if (status && status >= 400) {
      const url    = `${originalRequest?.baseURL ?? ''}${originalRequest?.url ?? ''}`;
      const method = (originalRequest?.method ?? 'REQUEST').toUpperCase();
      console.warn(`[API ${status}] ${method} ${url} — ${serverMessage ?? error.message}`);
    }

    // ── CSRF retry ─────────────────────────────────────────────────────────
    // The server returned 403 with a CSRF-related message.
    // Force-refresh the token (bypassing the cookie cache) and retry once.
    if (
      status === 403 &&
      serverMessage?.toLowerCase().includes('csrf') &&
      originalRequest &&
      !originalRequest._csrfRetry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._csrfRetry = true;

      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), CSRF_TIMEOUT_MS);

      const freshToken = await axios
        .get<{ csrfToken: string }>(`${baseURL}/csrf-token`, {
          withCredentials: true,
          signal: controller.signal,
        })
        .then((r) => r.data?.csrfToken || getCookie('csrfToken') || '')
        .catch(() => '')
        .finally(() => clearTimeout(timeoutId));

      if (freshToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers['X-CSRF-Token'] = freshToken;
        return api(originalRequest);
      }
    }

    // ── Silent token refresh on 401 ────────────────────────────────────────
    // Deduplicated: if multiple concurrent requests all 401 at once,
    // only one refresh call is made; all others await the same promise.
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const csrfToken = getCookie('csrfToken');
          const headers: Record<string, string> = {};
          if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

          refreshPromise = axios
            .post(`${baseURL}/auth/refresh`, {}, { headers, withCredentials: true })
            .then((response) => {
              const { user } = response.data;
              saveAuthTokens(user);
              if (user) store.dispatch(setCredentials({ user }));
              return response;
            })
            .catch((refreshError: unknown) => {
              // Refresh itself failed — clear local state and force re-login.
              clearAuthTokens();
              store.dispatch(logout());
              throw refreshError;
            })
            .finally(() => {
              // Always clear the singleton so the next 401 can try again.
              refreshPromise = null;
            });
        }

        await refreshPromise;
        // Replay the original request with the new session cookie.
        return api(originalRequest);
      } catch {
        // Propagate the original 401, not the refresh error, so callers
        // receive a meaningful status code rather than a secondary error.
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
