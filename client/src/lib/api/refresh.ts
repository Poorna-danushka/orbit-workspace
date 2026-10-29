import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { sessionEvents } from '@/lib/auth/events';
import type { OrbitRequestConfig } from './types';

type RefreshRequestConfig = AxiosRequestConfig & Pick<OrbitRequestConfig, 'skipAuthRefresh'>;

let refreshPromise: Promise<void> | null = null;

async function performRefresh(api: AxiosInstance): Promise<void> {
  const config: RefreshRequestConfig = {
    withCredentials: true,
    skipAuthRefresh: true,
  };
  await api.post('/auth/refresh', {}, config);
  sessionEvents.emit('session-refreshed', { timestamp: Date.now() });
}

async function performRefreshWithLock(api: AxiosInstance): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    await navigator.locks.request('orbit-refresh', { mode: 'exclusive' }, () =>
      performRefresh(api),
    );
    return;
  }
  await performRefresh(api);
}

export function refreshSession(api: AxiosInstance): Promise<void> {
  if (!refreshPromise) {
    const request = performRefreshWithLock(api);
    const wrappedRequest = request.finally(() => {
      if (refreshPromise === wrappedRequest) refreshPromise = null;
    });
    refreshPromise = wrappedRequest;
  }
  return refreshPromise;
}
