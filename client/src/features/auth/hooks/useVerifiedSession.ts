'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { getStoredUser } from '@/lib/auth/storage';
import { verifyCurrentSession } from '@/features/auth/services/sessionVerification';
import type { User } from '@/types/user';
import { useAsyncResource } from '@/hooks/useAsyncResource';

type VerificationState = 'checking' | 'ready' | 'error';

export function useVerifiedSession(): {
  error: unknown;
  retry: () => void;
  state: VerificationState;
  user: User | null;
} {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loadSession = useCallback(() => verifyCurrentSession(), []);
  const { data: verifiedUser, loading, error, reload } = useAsyncResource<User>(loadSession);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) dispatch(setCredentials({ user: storedUser }));
  }, [dispatch]);

  useEffect(() => {
    if (verifiedUser) dispatch(setCredentials({ user: verifiedUser }));
  }, [dispatch, verifiedUser]);

  const state: VerificationState = loading ? 'checking' : error ? 'error' : 'ready';
  return { error, retry: () => void reload(), state, user: verifiedUser ?? user };
}
