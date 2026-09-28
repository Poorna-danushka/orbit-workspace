import type { User } from '@/store/slices/authSlice';

let verifiedAdmin: User | null = null;
let sessionVersion = 0;

export function getVerifiedAdminUser(): User | null {
  return verifiedAdmin;
}

export function getAdminSessionVersion(): number {
  return sessionVersion;
}

export function cacheVerifiedAdminUser(user: User, version: number): void {
  if (version === sessionVersion) verifiedAdmin = user;
}

export function updateVerifiedAdminUser(user: User): void {
  if (verifiedAdmin?.id === user.id && user.role === 'admin') verifiedAdmin = user;
}

export function clearVerifiedAdminUser(): void {
  sessionVersion += 1;
  verifiedAdmin = null;
}
