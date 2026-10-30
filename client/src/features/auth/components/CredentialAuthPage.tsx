'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AuthBrandPanel from './AuthBrandPanel';
import CredentialAuthForm from './CredentialAuthForm';
import useCredentialAuth, { type CredentialAuthVariant } from '../hooks/useCredentialAuth';

function CredentialAuthContent({ variant }: { variant: CredentialAuthVariant }) {
  const form = useCredentialAuth(variant);

  return (
    <div
      className="ob-auth-screen"
      style={{
        display: 'flex',
        minHeight: '100dvh',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--ob-bg)',
      }}
    >
      <AuthBrandPanel variant={variant} />
      <CredentialAuthForm form={form} />
    </div>
  );
}

export default function CredentialAuthPage({ variant }: { variant: CredentialAuthVariant }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ob-bg)',
          }}
        >
          <div
            style={{
              color: 'var(--ob-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Loader2 size={36} style={{ animation: 'orbit-spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--ob-text-muted)', fontWeight: 500 }}>
              {variant === 'login' ? 'Loading Orbit...' : 'Setting up Orbit...'}
            </span>
          </div>
        </div>
      }
    >
      <CredentialAuthContent variant={variant} />
    </Suspense>
  );
}
