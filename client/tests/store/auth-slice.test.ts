import reducer, { logout, setCredentials } from '@/store/slices/authSlice';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

test('credentials authenticate the user and stop the loading state', () => {
  const user = {
    id: 'user-1',
    username: 'Orbit User',
    email: 'user@example.test',
    role: 'user' as const,
  };

  expect(reducer(initialState, setCredentials({ user }))).toEqual({
    user,
    isAuthenticated: true,
    loading: false,
  });
});

test('logout clears the user session', () => {
  const authenticated = reducer(
    initialState,
    setCredentials({
      user: {
        id: 'user-1',
        username: 'Orbit User',
        email: 'user@example.test',
        role: 'user' as const,
      },
    }),
  );

  expect(reducer(authenticated, logout())).toEqual({
    user: null,
    isAuthenticated: false,
    loading: false,
  });
});

test.each(['ADMIN', 'USER', 'Admin', 'User', '', null, undefined, 'unknown', 1])(
  'unsupported role %s cannot establish an authenticated state',
  (role) => {
    const invalidUser = {
      id: 'user-1',
      username: 'Orbit User',
      email: 'user@example.test',
      role,
    };

    expect(
      reducer(initialState, {
        type: 'auth/setCredentials',
        payload: { user: invalidUser },
      }),
    ).toEqual({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  },
);
