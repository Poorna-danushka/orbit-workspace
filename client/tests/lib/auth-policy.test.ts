import { decideAuthAction, isRefreshableAuthCode } from '@/lib/api/auth-policy';
import type { OrbitRequestConfig } from '@/lib/api/types';

const request = (url: string, extra: Partial<OrbitRequestConfig> = {}) =>
  ({ url, baseURL: 'https://api.example.test/api', ...extra }) as OrbitRequestConfig;

const error = (status: number, code: string) => ({
  response: { status, data: { code } },
});

test.each(['AUTH_TOKEN_EXPIRED', 'AUTH_TOKEN_MISSING'])(
  '%s refreshes a protected request',
  (code) => {
    expect(decideAuthAction(error(401, code), request('/user/me'))).toBe('refresh');
  },
);

test.each(['AUTH_TOKEN_EXPIRED', 'AUTH_TOKEN_MISSING'])(
  '%s is refreshable for HTTP and socket authentication',
  (code) => {
    expect(isRefreshableAuthCode(code)).toBe(true);
  },
);

test.each(['AUTH_TOKEN_INVALID', 'AUTH_USER_NOT_FOUND', undefined])(
  '%s is not refreshable',
  (code) => {
    expect(isRefreshableAuthCode(code)).toBe(false);
  },
);

test.each([
  'AUTH_TOKEN_INVALID',
  'AUTH_USER_NOT_FOUND',
  'AUTH_REFRESH_MISSING',
  'AUTH_REFRESH_EXPIRED',
  'AUTH_REFRESH_INVALID',
])('%s ends the session', (code) => {
  expect(decideAuthAction(error(401, code), request('/user/me'))).toBe('end-session');
});

test('CSRF errors retry while transient and excluded auth errors pass through', () => {
  expect(decideAuthAction(error(403, 'CSRF_INVALID'), request('/projects'))).toBe('retry-csrf');
  expect(decideAuthAction(error(401, 'AUTH_TOKEN_EXPIRED'), request('/auth/login'))).toBe(
    'pass-through',
  );
  expect(decideAuthAction(error(429, 'RATE_LIMITED'), request('/user/me'))).toBe('pass-through');
  expect(decideAuthAction(error(500, 'INTERNAL_ERROR'), request('/user/me'))).toBe('pass-through');
});
