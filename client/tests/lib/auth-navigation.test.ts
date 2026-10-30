import { getPostAuthPath } from '@/lib/auth/redirect';

test('admins are always routed to the admin dashboard', () => {
  expect(getPostAuthPath('admin', '/projects')).toBe('/admin-dashboard');
});

test('users may continue to a safe internal destination', () => {
  expect(getPostAuthPath('user', '/projects?filter=mine')).toBe('/projects?filter=mine');
});

test.each([
  '//attacker.example',
  '/admin-users',
  '/login',
  '/%2f%2fattacker.example',
  '/%252f%252fattacker.example',
  '/\\attacker.example',
  '/%5cattacker.example',
  '/%2561dmin-dashboard',
  '/admin%252fusers',
  '/administrator',
])('unsafe post-login path %s falls back to the dashboard', (path) => {
  expect(getPostAuthPath('user', path)).toBe('/dashboard');
});
