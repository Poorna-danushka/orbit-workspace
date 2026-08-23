/**
 * Axios Configuration Module
 * 
 * Configures axios instance for user API requests with:
 * - Automatic access token injection
 * - Automatic token refresh on 401 errors
 * - Session persistence via cookies
 * - Redux state synchronization
 * 
 * @module axios
 * @see {@link http://localhost:5000/api} Backend API endpoint
 */

import axios from 'axios';
import { store } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';
import { saveAuthTokens, clearAuthTokens, getCookie } from './tokenStorage';

/**
 * API base URL
 * Uses environment variable or defaults to local development server
 */
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const baseURL = process.env.NEXT_PUBLIC_API_URL || `${serverUrl}/api`;

/**
 * Axios instance for user API requests
 * 
 * Features:
 * - Automatic CSRF token injection
 * - Automatic token refresh via response interceptor
 * - JSON content type by default
 * - Error handling with token refresh fallback
 * 
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.defaults.withCredentials = true;

// Set JSON content-type for every non-FormData request
api.interceptors.request.use(
  (config) => {
    // If sending FormData, remove any preset Content-Type so
    // the browser / axios can set it with the correct boundary.
    if (config.data instanceof FormData) {
      if (config.headers) delete config.headers['Content-Type'];
    } else if (config.headers && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Attach CSRF Token from cookie
    const csrfToken = getCookie('csrfToken');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * 
 * Handles authentication errors and automatic token refresh.
 */
let refreshPromise: Promise<any> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const serverMessage = error.response?.data?.message;

    if (status && status >= 400) {
      console.warn(`[API ${status} Error] ${method} ${url}:`, serverMessage || error.message);
    }
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/forgot-password') ||
      originalRequest?.url?.includes('/auth/reset-password');

    // Only attempt refresh for 401 errors on non-auth routes and if not already retrying
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          const csrfToken = getCookie('csrfToken');
          const headers: Record<string, string> = {};
          if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
          }
          refreshPromise = axios.post(`${baseURL}/auth/refresh`, {}, { headers, withCredentials: true })
            .then((res) => {
              const { user } = res.data;
              // Save new user metadata to cookies
              saveAuthTokens(user);
              // Update Redux state with new user metadata
              if (user) {
                store.dispatch(setCredentials({ user }));
              }
              refreshPromise = null;
              return res;
            })
            .catch((err) => {
              refreshPromise = null;
              // Token refresh failed - logout user
              clearAuthTokens();
              store.dispatch(logout());
              throw err;
            });
        }
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Export configured axios instance
 * Use this for all user API requests
 */
export default api;

