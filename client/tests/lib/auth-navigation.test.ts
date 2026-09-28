import { getPostAuthPath } from '@/lib/authNavigation';

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
  '/\\attacker.example',
])('unsafe post-login path %s falls back to the dashboard', (path) => {
  expect(getPostAuthPath('user', path)).toBe('/dashboard');
});
