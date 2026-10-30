'use client';

import type { ReactNode } from 'react';
import ErrorState from '@/components/ui/ErrorState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/lib/errors';
import { normalizeError } from '@/lib/errors';
import { useVerifiedSession } from '@/features/auth/hooks/useVerifiedSession';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { error, retry, state } = useVerifiedSession();

  if (state === 'ready') return children;
  if (state === 'error') {
    return (
      <ErrorState
        message={getErrorMessage(error, 'Unable to verify your session.')}
        error={normalizeError(error)}
        onRetry={retry}
      />
    );
  }
  return <LoadingSpinner variant="workspace" message="Verifying your session..." />;
}
