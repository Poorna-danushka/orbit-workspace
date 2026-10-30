'use client';

import Link from 'next/link';
import { Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import OrbitIcon from '@/components/ui/OrbitIcon';
import { ROUTES } from '@/lib/constants/routes';
import { useForgotPassword } from '../hooks/useForgotPassword';
import AuthAlert from './AuthAlert';
import AuthCard from './AuthCard';
import AuthField from './AuthField';
import AuthPageLayout from './AuthPageLayout';

export default function ForgotPassword() {
  const { email, loading, error, success, onEmailChange, onSubmit } = useForgotPassword();

  return (
    <AuthPageLayout variant="forgot">
      <AuthCard>
        {success ? (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(34,211,160,0.12)',
                border: '1px solid rgba(34,211,160,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#22d3a0',
              }}
            >
              <CheckCircle2 size={30} />
            </div>
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: 'var(--ob-text)',
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              Check your inbox
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--ob-text-muted)',
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              If an account exists for <strong style={{ color: 'var(--ob-text)' }}>{email}</strong>,
              a password reset link has been sent.
            </p>
            <div
              style={{
                background: 'rgba(124,110,255,0.08)',
                border: '1px solid rgba(124,110,255,0.2)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 28,
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--ob-primary)',
                  marginBottom: 4,
                }}
              >
                💡 Developer Note
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>
                Mock email delivery is active. Check the{' '}
                <strong>server backend terminal logs</strong> to retrieve the reset URL.
              </p>
            </div>
            <Link
              href={ROUTES.login}
              className="ob-btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                borderRadius: 12,
                height: 48,
                fontSize: '0.9rem',
              }}
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
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
                Reset your password
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--ob-text-muted)', lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            <AuthAlert message={error} marginBottom={20} />

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AuthField
                id="forgot-email"
                label="Email address"
                icon={Mail}
                type="email"
                value={email}
                onChange={onEmailChange}
                placeholder="you@company.com"
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={loading || !email}
                className="ob-btn-primary"
                style={{
                  width: '100%',
                  height: 50,
                  fontSize: '0.95rem',
                  borderRadius: 12,
                  justifyContent: 'center',
                  opacity: !email || loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link
                href={ROUTES.login}
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--ob-text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ob-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ob-text-muted)';
                }}
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
