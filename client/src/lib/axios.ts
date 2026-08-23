import axios from 'axios';
import { store } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';
import { saveAuthTokens, clearAuthTokens, getCookie } from './tokenStorage';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const baseURL = process.env.NEXT_PUBLIC_API_URL || `${serverUrl}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.defaults.withCredentials = true;

let csrfPromise: Promise<string> | null = null;

const getCsrfToken = async () => {
  const existingToken = getCookie('csrfToken');

  if (existingToken) {
    return existingToken;
  }

  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${baseURL}/csrf-token`, {
        withCredentials: true,
      })
      .then(
        (response) =>
          response.data?.csrfToken ||
          getCookie('csrfToken') ||
          ''
      )
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

api.interceptors.request.use(
  async (config) => {
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else if (
      config.headers &&
      !config.headers['Content-Type']
    ) {
      config.headers['Content-Type'] = 'application/json';
    }

    const method = config.method?.toUpperCase() || 'GET';

    const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    if (!safeMethods.includes(method) && typeof window !== 'undefined') {
      const csrfToken = await getCsrfToken();

      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<any> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const serverMessage = error.response?.data?.message;

    const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    const method = error.config?.method?.toUpperCase() || 'REQUEST';

    if (status && status >= 400) {
      console.warn(
        `[API ${status} Error] ${method} ${url}:`,
        serverMessage || error.message
      );
    }

    if (
      status === 403 &&
      serverMessage?.toLowerCase().includes('csrf') &&
      originalRequest &&
      !originalRequest._csrfRetry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._csrfRetry = true;

      const freshToken = await axios
        .get(`${baseURL}/csrf-token`, {
          withCredentials: true,
        })
        .then(
          (response) =>
            response.data?.csrfToken ||
            getCookie('csrfToken') ||
            ''
        )
        .catch(() => '');

      if (freshToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['X-CSRF-Token'] = freshToken;
        return api(originalRequest);
      }
    }

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/forgot-password') ||
      originalRequest?.url?.includes('/auth/reset-password');

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const csrfToken = getCookie('csrfToken');
          const headers: Record<string, string> = {};

          if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
          }

          refreshPromise = axios
            .post(
              `${baseURL}/auth/refresh`,
              {},
              {
                headers,
                withCredentials: true,
              }
            )
            .then((response) => {
              const { user } = response.data;

              saveAuthTokens(user);

              if (user) {
                store.dispatch(setCredentials({ user }));
              }

              refreshPromise = null;
              return response;
            })
            .catch((refreshError) => {
              refreshPromise = null;
              clearAuthTokens();
              store.dispatch(logout());
              throw refreshError;
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

export default api;

