'use client';

import { useState, type FormEvent } from 'react';
import { resetPassword } from '@/features/auth/services/authService';
import { submitAuthRequest } from '../utils/submitAuthRequest';
import useAuthRequestFeedback from './useAuthRequestFeedback';

export interface ResetPasswordModel {
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  success: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useResetPassword(token: string | null): ResetPasswordModel {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, setLoading, error, setError, success, setSuccess } = useAuthRequestFeedback();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError('Reset token is missing from the URL.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    await submitAuthRequest({
      request: () => resetPassword(token, password),
      setLoading,
      setError,
      setSuccess,
      fallback: 'Failed to reset password. The link may have expired.',
    });
  };

  return {
    password,
    confirmPassword,
    loading,
    error,
    success,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onSubmit,
  };
}
