'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import OrbitIcon from '@/components/ui/OrbitIcon';
import AuthCard from './AuthCard';
import AuthPageLayout from './AuthPageLayout';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout variant="reset">
      <AuthCard>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              color: 'var(--ob-primary)',
              marginBottom: 16,
            }}
          >
            <OrbitIcon size={40} />
          </div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: '1.7rem',
              color: 'var(--ob-text)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Choose a new password
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>
            Enter and confirm your new secure password below.
          </p>
        </div>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '20px 0',
              }}
            >
              <Loader2
                size={28}
                style={{ animation: 'spin 1s linear infinite', color: 'var(--ob-primary)' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--ob-text-muted)' }}>Loading...</span>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthPageLayout>
  );
}
