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
    role: 'user',
  };

  expect(reducer(initialState, setCredentials({ user }))).toEqual({
    user,
    isAuthenticated: true,
    loading: false,
  });
});

test('logout clears the user session', () => {
  const authenticated = reducer(initialState, setCredentials({
    user: {
      id: 'user-1',
      username: 'Orbit User',
      email: 'user@example.test',
      role: 'user',
    },
  }));

  expect(reducer(authenticated, logout())).toEqual({
    user: null,
    isAuthenticated: false,
    loading: false,
  });
});
