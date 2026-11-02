import { getStoredUser } from '@/lib/auth/storage';

const user = (role: unknown) => ({
  id: 'user-1',
  username: 'Orbit User',
  email: 'user@example.test',
  role,
});

beforeEach(() => {
  window.localStorage.clear();
});

test.each(['admin', 'user'])('stored metadata accepts exact role %s', (role) => {
  const storedUser = user(role);
  window.localStorage.setItem('userInfo', JSON.stringify(storedUser));

  expect(getStoredUser()).toEqual(storedUser);
});

test.each(['ADMIN', 'USER', 'Admin', 'User', 'unknown', '', null, undefined, 1])(
  'stored metadata rejects unsupported role %s',
  (role) => {
    window.localStorage.setItem('userInfo', JSON.stringify(user(role)));

    expect(getStoredUser()).toBeNull();
  },
);
