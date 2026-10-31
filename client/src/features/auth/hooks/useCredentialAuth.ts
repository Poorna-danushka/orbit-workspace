'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { getErrorMessage } from '@/lib/errors';
import { setCredentials } from '@/store/slices/authSlice';
import { saveUserMetadata } from '@/lib/auth/storage';
import { getPostAuthPath } from '@/lib/auth/redirect';
import { markSessionActive } from '@/lib/auth/session';
import { getGoogleOAuthUrl, login, register } from '@/features/auth/services/authService';
import { verifyCurrentSession } from '@/features/auth/services/sessionVerification';
import { useAsyncResource } from '@/hooks/useAsyncResource';

export type CredentialAuthVariant = 'login' | 'register';

export default function useCredentialAuth(variant: CredentialAuthVariant) {
  const isLogin = variant === 'login';
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const nextPath = searchParams.get('next') || '';
  const googleStatus = searchParams.get('google');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadGoogleSession = useCallback(async () => {
    markSessionActive();
    return verifyCurrentSession();
  }, []);
  const googleSession = useAsyncResource(loadGoogleSession, {
    enabled: isLogin && googleStatus === 'success',
  });

  useEffect(() => {
    const user = googleSession.data;
    if (!user || !isLogin) return;
    dispatch(setCredentials({ user }));
    router.replace(getPostAuthPath(user.role, nextPath));
  }, [dispatch, googleSession.data, isLogin, nextPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = isLogin
        ? await login({ email, password })
        : await register({ username, email, password });
      const { user } = response.data;
      saveUserMetadata(user);
      markSessionActive();
      dispatch(setCredentials({ user }));
      router.replace(getPostAuthPath(user.role, nextPath));
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, isLogin ? 'Failed to login' : 'Failed to register'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    try {
      window.location.assign(getGoogleOAuthUrl(nextPath));
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          'Google sign-in is temporarily unavailable. Please try again later.',
        ),
      );
      setLoading(false);
    }
  };

  const googleError =
    isLogin && (googleStatus === 'error' || googleSession.error)
      ? 'Google sign-in could not be completed. Please try again.'
      : '';

  return {
    variant,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loading: loading || (isLogin && googleStatus === 'success' && googleSession.loading),
    error: error || googleError,
    handleSubmit,
    handleGoogleLogin,
  };
}
