'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import ErrorState from '@/components/ui/ErrorState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getErrorMessage, normalizeError } from '@/lib/errors';
import { useVerifiedSession } from '@/lib/auth/useVerifiedSession';

export default function AdminGate({ children }: { children: ReactNode }) {
  const { error, retry, state, user } = useVerifiedSession();
  const router = useRouter();
  const isAdmin = state === 'ready' && user?.role === 'admin';

  useEffect(() => {
    if (state === 'ready' && !isAdmin) router.replace('/dashboard');
  }, [isAdmin, router, state]);

  if (isAdmin) return children;
  if (state === 'error') {
    return (
      <ErrorState
        message={getErrorMessage(error, 'Unable to verify administrator access.')}
        error={normalizeError(error)}
        onRetry={retry}
      />
    );
  }
  return <LoadingSpinner variant="admin" message="Verifying access..." />;
}
