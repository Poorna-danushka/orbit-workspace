import type { Dispatch, SetStateAction } from 'react';
import { getErrorMessage } from '@/lib/errors';

interface SubmitAuthRequestOptions {
  request: () => Promise<unknown>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  fallback: string;
}

export async function submitAuthRequest({
  request,
  setLoading,
  setError,
  setSuccess,
  fallback,
}: SubmitAuthRequestOptions): Promise<void> {
  setLoading(true);
  setError('');
  try {
    await request();
    setSuccess(true);
  } catch (error: unknown) {
    setError(getErrorMessage(error, fallback));
  } finally {
    setLoading(false);
  }
}
