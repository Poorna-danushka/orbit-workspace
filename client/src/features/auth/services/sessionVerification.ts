import type { User } from '@/types/user';
import { getCurrentUser } from '@/features/auth/services/authService';
import { saveUserMetadata } from '@/lib/auth/storage';
import { sessionEvents } from '@/lib/auth/events';

let verifiedUser: User | null = null;
let verificationRequest: Promise<User> | null = null;

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string'
  );
}

function unwrapUser(response: unknown): User {
  if (!response || typeof response !== 'object') {
    throw new Error('Authenticated user profile is unavailable.');
  }
  const data = response as Record<string, unknown>;
  const user = 'user' in data ? data.user : response;
  if (!isUser(user)) throw new Error('Authenticated user profile is unavailable.');
  return user;
}

function clearVerifiedSession(): void {
  verifiedUser = null;
  verificationRequest = null;
}

export function updateVerifiedUser(user: User): void {
  if (verifiedUser?.id === user.id) verifiedUser = user;
}

sessionEvents.on('session-ended', clearVerifiedSession);
sessionEvents.on('session-started', clearVerifiedSession);

export function verifyCurrentSession(): Promise<User> {
  if (verifiedUser) return Promise.resolve(verifiedUser);
  if (verificationRequest) return verificationRequest;

  const request = getCurrentUser().then(({ data }) => {
    const user = unwrapUser(data);
    verifiedUser = user;
    saveUserMetadata(user);
    return user;
  });
  const trackedRequest = request.finally(() => {
    if (verificationRequest === trackedRequest) verificationRequest = null;
  });
  verificationRequest = trackedRequest;
  return trackedRequest;
}
