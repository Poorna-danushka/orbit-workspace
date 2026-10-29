import type { User } from '@/types/user';
import { logger } from '@/lib/utils/logger';

const USER_STORAGE_KEY = 'userInfo';
const LEGACY_USER_COOKIE_NAMES = ['userInfo', 'adminInfo'];

function isStoredUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<User>;
  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string'
  );
}

export function saveUserMetadata(user: User): void {
  if (typeof window === 'undefined') return;
  const metadata: User = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null,
    ...(user.createdAt ? { createdAt: user.createdAt } : {}),
  };
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(metadata));
  } catch {
    logger.warn('Unable to persist user display metadata');
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    logger.warn('Unable to read user display metadata');
    return null;
  }
  if (!serialized) return null;

  try {
    const parsed: unknown = JSON.parse(serialized);
    return isStoredUser(parsed) ? parsed : null;
  } catch {
    logger.warn('Stored user display metadata is invalid');
    return null;
  }
}

export function clearUserStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem('adminInfo');
  } catch {
    logger.warn('Unable to clear user display metadata');
  }
  for (const name of LEGACY_USER_COOKIE_NAMES) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}
