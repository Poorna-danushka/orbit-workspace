'use client';

import { useState, type FormEvent } from 'react';
import { requestPasswordReset } from '@/features/auth/services/authService';
import { submitAuthRequest } from '../utils/submitAuthRequest';
import useAuthRequestFeedback from './useAuthRequestFeedback';

export interface ForgotPasswordModel {
  email: string;
  loading: boolean;
  error: string;
  success: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useForgotPassword(): ForgotPasswordModel {
  const [email, setEmail] = useState('');
  const { loading, setLoading, error, setError, success, setSuccess } = useAuthRequestFeedback();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitAuthRequest({
      request: () => requestPasswordReset(email),
      setLoading,
      setError,
      setSuccess,
      fallback: 'Failed to submit request',
    });
  };

  return { email, loading, error, success, onEmailChange: setEmail, onSubmit };
}
