'use client';

import { useEffect, useState } from 'react';
import { verifyCurrentSession } from '@/features/auth/services/sessionVerification';
import { getStoredUser } from '@/lib/auth/storage';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import type { User } from '@/types/user';

type InvitationSessionState = 'anonymous' | 'checking' | 'ready' | 'error';

export default function useInvitationSession(): {
  error: unknown;
  state: InvitationSessionState;
  user: User | null;
} {
  const dispatch = useAppDispatch();
  const [hasStoredSession] = useState(() => getStoredUser() !== null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [state, setState] = useState<InvitationSessionState>(
    hasStoredSession ? 'checking' : 'anonymous',
  );

  useEffect(() => {
    if (!hasStoredSession) return;
    let active = true;
    void verifyCurrentSession().then(
      (verifiedUser) => {
        if (!active) return;
        dispatch(setCredentials({ user: verifiedUser }));
        setUser(verifiedUser);
        setState('ready');
      },
      (sessionError: unknown) => {
        if (!active) return;
        setError(sessionError);
        setState('error');
      },
    );
    return () => {
      active = false;
    };
  }, [dispatch, hasStoredSession]);

  return { error, state, user };
}
