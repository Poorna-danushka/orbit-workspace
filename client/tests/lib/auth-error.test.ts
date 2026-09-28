import { AxiosError, type AxiosResponse } from 'axios';
import { getAuthErrorMessage } from '@/lib/authError';

function createAxiosError(data: unknown) {
  const error = new AxiosError('Request failed');
  error.response = { data } as AxiosResponse;
  return error;
}

test('shows backend validation errors from Axios responses', () => {
  expect(getAuthErrorMessage(createAxiosError({
    errors: [{ msg: 'Email is invalid' }, { msg: 'Password is required' }],
  }), 'Sign-in failed')).toBe('Email is invalid Password is required');
});

test('uses the API message and falls back for non-Axios errors', () => {
  expect(getAuthErrorMessage(createAxiosError({ message: 'Invalid credentials' }), 'Try again'))
    .toBe('Invalid credentials');
  expect(getAuthErrorMessage(new Error('Network unavailable'), 'Try again'))
    .toBe('Network unavailable');
  expect(getAuthErrorMessage(null, 'Try again')).toBe('Try again');
});
