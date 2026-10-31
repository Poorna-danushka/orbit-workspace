import { toast } from 'sonner';
import { clearCsrfToken } from '@/lib/api/csrf';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { clearUserStorage } from './storage';
import { sessionEvents } from './events';
import { getSessionRedirectUrl } from './redirect';
import { redirectTo } from './navigate';

type SessionMessage = {
  type: 'logout' | 'session-ended';
  timestamp: number;
};

let sessionEndHandled = false;
let channel: BroadcastChannel | null = null;

function isSessionMessage(value: unknown): value is SessionMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<SessionMessage>;
  return (
    (message.type === 'logout' || message.type === 'session-ended') &&
    typeof message.timestamp === 'number'
  );
}

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel('orbit-session');
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isSessionMessage(event.data)) endSession(event.data.type, false, false);
    };
  }
  return channel;
}

export function markSessionActive(): void {
  sessionEndHandled = false;
  sessionEvents.emit('session-started', { timestamp: Date.now() });
}

export function endSession(
  reason: 'logout' | 'session-ended' = 'session-ended',
  broadcast = true,
  shouldRedirect = true,
): void {
  if (sessionEndHandled) return;
  sessionEndHandled = true;

  const currentPath =
    typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`;
  clearUserStorage();
  clearCsrfToken();
  store.dispatch(logout());
  sessionEvents.emit('session-ended', { reason, timestamp: Date.now() });

  if (reason === 'session-ended') {
    toast.error('Your session has ended. Please sign in again.');
  }

  if (broadcast) getBroadcastChannel()?.postMessage({ type: reason, timestamp: Date.now() });
  if (shouldRedirect && typeof window !== 'undefined') {
    const redirectUrl = getSessionRedirectUrl(currentPath);
    if (redirectUrl) redirectTo(redirectUrl);
  }
}

if (typeof window !== 'undefined') getBroadcastChannel();
