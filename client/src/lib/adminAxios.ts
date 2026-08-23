import axios from 'axios';
import { store } from '../store';
import {
  saveAuthTokens,
  clearAuthTokens,
  getCookie,
} from './tokenStorage';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const baseURL = process.env.NEXT_PUBLIC_API_URL || `${serverUrl}/api`;

const adminApi = axios.create({ baseURL });

adminApi.defaults.withCredentials = true;

adminApi.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) delete config.headers['Content-Type'];
  } else if (config.headers && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  const csrfToken = getCookie('csrfToken');
  if (csrfToken && config.headers) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
}, (error) => Promise.reject(error));

let adminRefreshPromise: Promise<any> | null = null;

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const serverMessage = error.response?.data?.message;

    if (status && status >= 400) {
      console.warn(`[Admin API ${status} Error] ${method} ${url}:`, serverMessage || error.message);
    }
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!adminRefreshPromise) {
          const csrfToken = getCookie('csrfToken');
          const headers: Record<string, string> = {};
          if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
          }
          adminRefreshPromise = axios
            .post(`${baseURL}/auth/refresh`, {}, { headers, withCredentials: true })
            .then((res) => {
              const { user } = res.data;
              saveAuthTokens(user);
              if (user?.role === 'admin') {
                const admin = store.getState().adminAuth?.admin;
                if (admin) {
                  store.dispatch({ type: 'adminAuth/setAdminCredentials', payload: { admin: { ...admin, ...user } } });
                }
              } else {
                const userState = store.getState().auth?.user;
                if (userState) {
                  store.dispatch({ type: 'auth/setCredentials', payload: { user: { ...userState, ...user } } });
                }
              }
              adminRefreshPromise = null;
              return res;
            })
            .catch((err) => {
              adminRefreshPromise = null;
              store.dispatch({ type: 'adminAuth/adminLogout' });
              store.dispatch({ type: 'auth/logout' });
              clearAuthTokens();
              if (typeof window !== 'undefined') {
                window.location.href = '/admin-login';
              }
              throw err;
            });
        }
        await adminRefreshPromise;
        return adminApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
