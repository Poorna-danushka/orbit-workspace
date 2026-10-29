import { AxiosError, type AxiosResponse } from 'axios';
import { getErrorMessage } from '@/lib/errors';

function createAxiosError(data: unknown) {
  const error = new AxiosError('Request failed');
  error.response = { data } as AxiosResponse;
  return error;
}

test('shows backend validation errors from Axios responses', () => {
  expect(getErrorMessage(createAxiosError({
    errors: [{ message: 'Email is invalid' }, { message: 'Password is required' }],
  }), 'Sign-in failed')).toBe('Email is invalid Password is required');
});

test('uses the API message and falls back for non-Axios errors', () => {
  expect(getErrorMessage(createAxiosError({ message: 'Invalid credentials' }), 'Try again'))
    .toBe('Invalid credentials');
  expect(getErrorMessage(new Error('Network unavailable'), 'Try again'))
    .toBe('Network unavailable');
  expect(getErrorMessage(null, 'Try again')).toBe('Try again');
});
