import api from '@/lib/axios';
import type { User } from '@/store/slices/authSlice';
import {
  cacheVerifiedAdminUser,
  clearVerifiedAdminUser,
  getAdminSessionVersion,
  getVerifiedAdminUser,
} from '@/lib/adminSessionCache';

export { getVerifiedAdminUser };

let pendingVerification: { version: number; promise: Promise<User> } | null = null;

export function verifyAdminSession(): Promise<User> {
  const verifiedAdmin = getVerifiedAdminUser();
  if (verifiedAdmin) return Promise.resolve(verifiedAdmin);

  const currentVersion = getAdminSessionVersion();
  if (pendingVerification?.version === currentVersion) return pendingVerification.promise;

  const request = api.get('/user/me').then((response) => {
    const user = (response.data?.user || response.data) as User | undefined;
    if (!user || user.role !== 'admin') {
      throw new Error('Administrator access is required.');
    }
    cacheVerifiedAdminUser(user, currentVersion);
    return user;
  });

  const pending = { version: currentVersion, promise: request };
  pendingVerification = pending;
  const clearPending = () => {
    if (pendingVerification === pending) pendingVerification = null;
  };
  void request.then(clearPending, clearPending);

  return request;
}

export function clearAdminSession(): void {
  clearVerifiedAdminUser();
  pendingVerification = null;
}
