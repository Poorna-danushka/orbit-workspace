import { io, type Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/lib/config';
import api from '@/lib/api/client';
import { endSession } from '@/lib/auth/session';
import { sessionEvents } from '@/lib/auth/events';
import { refreshSession } from '@/lib/api/refresh';
import { isRefreshableAuthCode } from '@/lib/api/auth-policy';

let socket: Socket | null = null;
let refCount = 0;
let refreshInProgress = false;
let removeSessionListener: (() => void) | null = null;

function getSocketErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as { code?: unknown; data?: unknown };
  if (typeof record.code === 'string') return record.code;
  if (!record.data || typeof record.data !== 'object') return undefined;
  const data = record.data as { code?: unknown };
  return typeof data.code === 'string' ? data.code : undefined;
}

function registerSocketAuthHandlers(activeSocket: Socket): void {
  activeSocket.on('connect', () => {
    refreshInProgress = false;
  });
  activeSocket.on('connect_error', (error: unknown) => {
    const code = getSocketErrorCode(error);
    if (isRefreshableAuthCode(code)) {
      if (refreshInProgress) return;
      refreshInProgress = true;
      void refreshSession(api).then(
        () => {
          if (socket !== activeSocket) return;
          activeSocket.disconnect();
          activeSocket.connect();
        },
        () => {
          endSession('session-ended');
        },
      );
      return;
    }

    if (code?.startsWith('AUTH_')) endSession('session-ended');
  });
}

export function acquireSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL || '/', {
      withCredentials: true,
      autoConnect: true,
    });
    registerSocketAuthHandlers(socket);
    removeSessionListener = sessionEvents.on('session-ended', () => {
      socket?.disconnect();
    });
  }
  refCount += 1;
  return socket;
}

export function releaseSocket(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket) {
    socket.disconnect();
    socket = null;
    removeSessionListener?.();
    removeSessionListener = null;
    refreshInProgress = false;
  }
}
