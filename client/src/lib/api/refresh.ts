import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { sessionEvents } from '@/lib/auth/events';
import type { OrbitRequestConfig } from './types';

type RefreshRequestConfig = AxiosRequestConfig & Pick<OrbitRequestConfig, 'skipAuthRefresh'>;

let refreshPromise: Promise<void> | null = null;
const lastRefreshStorageKey = 'orbit:last-auth-refresh-at';

async function performRefresh(api: AxiosInstance): Promise<void> {
  const config: RefreshRequestConfig = {
    withCredentials: true,
    skipAuthRefresh: true,
  };
  await api.post('/auth/refresh', {}, config);
  sessionEvents.emit('session-refreshed', { timestamp: Date.now() });
}

function hasRefreshCompletedSince(requestStartedAt: number): boolean {
  if (typeof window === 'undefined') return false;
  const lastRefreshAt = Number(window.localStorage.getItem(lastRefreshStorageKey));
  return Number.isFinite(lastRefreshAt) && lastRefreshAt >= requestStartedAt;
}

async function performRefreshOnce(api: AxiosInstance, requestStartedAt: number): Promise<void> {
  if (hasRefreshCompletedSince(requestStartedAt)) return;
  await performRefresh(api);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(lastRefreshStorageKey, String(Date.now()));
  }
}

async function performRefreshWithLock(
  api: AxiosInstance,
  requestStartedAt: number,
): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    await navigator.locks.request('orbit-refresh', { mode: 'exclusive' }, () =>
      performRefreshOnce(api, requestStartedAt),
    );
    return;
  }
  await performRefreshOnce(api, requestStartedAt);
}

export function refreshSession(api: AxiosInstance, requestStartedAt = Date.now()): Promise<void> {
  if (!refreshPromise) {
    const request = performRefreshWithLock(api, requestStartedAt);
    const wrappedRequest = request.finally(() => {
      if (refreshPromise === wrappedRequest) refreshPromise = null;
    });
    refreshPromise = wrappedRequest;
  }
  return refreshPromise;
}
