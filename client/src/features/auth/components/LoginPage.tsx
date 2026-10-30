'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';
import { setCredentials } from '@/store/slices/authSlice';
import { saveUserMetadata } from '@/lib/auth/storage';
import { getPostAuthPath } from '@/lib/auth/redirect';
import { markSessionActive } from '@/lib/auth/session';
import {
  getGoogleOAuthUrl,
  login,
} from '@/features/auth/services/authService';
import { verifyCurrentSession } from '@/features/auth/services/sessionVerification';
import { LoginBrandPanel } from './LoginBrandPanel';
import LoginFormPanel from './LoginFormPanel';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const nextPath = searchParams.get('next') || '';
  const googleStatus = searchParams.get('google');

  useEffect(() => {
    if (googleStatus === 'error') {
      const timer = window.setTimeout(() => {
        setError('Google sign-in could not be completed. Please try again.');
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (googleStatus !== 'success') return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      markSessionActive();
      void verifyCurrentSession()
        .then((user) => {
          if (cancelled) return;
          dispatch(setCredentials({ user }));
          router.replace(getPostAuthPath(user.role, nextPath));
        })
        .catch(() => {
          if (cancelled) return;
          setError('Google sign-in could not be completed. Please try again.');
          setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [dispatch, googleStatus, nextPath, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login({ email, password });
      const { user } = response.data;
      saveUserMetadata(user);
      markSessionActive();
      dispatch(setCredentials({ user }));
      router.replace(getPostAuthPath(user.role, nextPath));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    try {
      window.location.assign(getGoogleOAuthUrl(nextPath));
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          'Google sign-in is temporarily unavailable. Please try again later.',
        ),
      );
      setLoading(false);
    }
  };

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
      <LoginBrandPanel />

      <LoginFormPanel
        email={email}
        password={password}
        rememberMe={rememberMe}
        showPwd={showPwd}
        loading={loading}
        error={error}
        setEmail={setEmail}
        setPassword={setPassword}
        setRememberMe={setRememberMe}
        setShowPwd={setShowPwd}
        handleLogin={handleLogin}
        handleGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
}

export default function Login() {
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
              Loading Orbit...
            </span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
