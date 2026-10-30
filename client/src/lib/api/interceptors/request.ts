import type { AxiosInstance } from 'axios';
import { getCsrfToken } from '../csrf';
import type { OrbitRequestConfig } from '../types';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

export function registerRequestInterceptor(api: AxiosInstance): void {
  api.interceptors.request.use(async (config) => {
    const method = (config.method ?? 'GET').toUpperCase();
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.setContentType(false);
    } else if (!config.headers.get('Content-Type')) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (!SAFE_METHODS.has(method) && typeof window !== 'undefined') {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config as OrbitRequestConfig;
  });
}
