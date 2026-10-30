'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useResetPassword } from '../hooks/useResetPassword';
import AuthAlert from './AuthAlert';
import PasswordField from './PasswordField';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const {
    password,
    confirmPassword,
    loading,
    error,
    success,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
  } = useResetPassword(token);

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#f43f5e',
          }}
        >
          <AlertCircle size={30} />
        </div>
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: 'var(--ob-text)',
            marginBottom: 12,
          }}
        >
          Invalid Reset Link
        </h2>
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--ob-text-muted)',
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          No secure token was found in the URL. Please verify the link you clicked or request a new
          one.
        </p>
        <Link
          href={ROUTES.forgotPassword}
          className="ob-btn-ghost"
          style={{ display: 'inline-flex', justifyContent: 'center' }}
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
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
          }}
        >
          Password updated!
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--ob-text-muted)',
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          Your password has been successfully reset. All active sessions have been signed out for
          your security.
        </p>
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
          Proceed to Login <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AuthAlert message={error} />
      <PasswordField
        id="new-password"
        label="New Password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Min 8 characters"
        autoComplete="new-password"
      />
      <PasswordField
        id="confirm-password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        placeholder="Confirm new password"
        autoComplete="new-password"
        confirmValue={password}
      />
      <button
        type="submit"
        disabled={loading}
        className="ob-btn-primary"
        style={{
          width: '100%',
          height: 50,
          fontSize: '0.95rem',
          borderRadius: 12,
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        {loading ? (
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <>
            <span>Set New Password</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
