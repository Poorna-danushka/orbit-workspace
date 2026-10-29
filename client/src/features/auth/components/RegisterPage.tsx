'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';
import { setCredentials } from '@/store/slices/authSlice';
import { saveUserMetadata } from '@/lib/auth/storage';
import { getPostAuthPath } from '@/lib/auth/redirect';
import { markSessionActive } from '@/lib/auth/session';
import { getGoogleOAuthUrl, register } from '@/features/auth/services/authService';
import { RegisterBrandPanel } from './RegisterBrandPanel';
import RegisterFormPanel from './RegisterFormPanel';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const nextPath = searchParams.get('next') || '';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await register({ username, email, password });
      const { user } = response.data;
      saveUserMetadata(user);
      markSessionActive();
      dispatch(setCredentials({ user }));
      router.replace(getPostAuthPath(user.role, nextPath));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to register'));
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
      <RegisterBrandPanel />

      <RegisterFormPanel
        username={username}
        email={email}
        password={password}
        showPwd={showPwd}
        loading={loading}
        error={error}
        setUsername={setUsername}
        setEmail={setEmail}
        setPassword={setPassword}
        setShowPwd={setShowPwd}
        handleRegister={handleRegister}
        handleGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
}

export default function Register() {
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
              Setting up Orbit...
            </span>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
