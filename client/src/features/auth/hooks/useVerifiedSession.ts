'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { getStoredUser } from '@/lib/auth/storage';
import { verifyCurrentSession } from '@/features/auth/services/sessionVerification';
import type { User } from '@/types/user';

type VerificationState = 'checking' | 'ready' | 'error';

export function useVerifiedSession(): {
  error: unknown;
  retry: () => void;
  state: VerificationState;
  user: User | null;
} {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const mounted = useRef(false);
  const [state, setState] = useState<VerificationState>('checking');
  const [error, setError] = useState<unknown>(null);

  const verify = useCallback(async () => {
    setState('checking');
    setError(null);
    try {
      const verifiedUser = await verifyCurrentSession();
      if (!mounted.current) return;
      dispatch(setCredentials({ user: verifiedUser }));
      setState('ready');
    } catch (verificationError: unknown) {
      if (!mounted.current) return;
      setError(verificationError);
      setState('error');
    }
  }, [dispatch]);

  useEffect(() => {
    mounted.current = true;
    const storedUser = getStoredUser();
    if (storedUser) dispatch(setCredentials({ user: storedUser }));
    const verificationTimer = window.setTimeout(() => void verify(), 0);
    return () => {
      mounted.current = false;
      window.clearTimeout(verificationTimer);
    };
  }, [dispatch, verify]);

  return { error, retry: () => void verify(), state, user };
}
