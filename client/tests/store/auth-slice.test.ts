import reducer, {
  logout,
  rehydrateAuth,
  setCredentials,
  setLoading,
  updateUser,
} from '@/store/slices/authSlice';

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

test('profile updates preserve fields that were not changed', () => {
  const state = reducer(initialState, setCredentials({
    user: {
      id: 'user-1',
      username: 'Orbit User',
      email: 'user@example.test',
      role: 'user',
    },
  }));

  expect(reducer(state, updateUser({ username: 'New Name' })).user).toEqual({
    id: 'user-1',
    username: 'New Name',
    email: 'user@example.test',
    role: 'user',
  });
});

test('loading can be ended without an authenticated user', () => {
  expect(reducer(initialState, setLoading(false))).toEqual({
    user: null,
    isAuthenticated: false,
    loading: false,
  });
});

test('rehydrates a saved user from browser storage', () => {
  window.localStorage.setItem('userInfo', JSON.stringify({
    id: 'user-1',
    username: 'Orbit User',
    email: 'user@example.test',
    role: 'user',
  }));

  expect(reducer(initialState, rehydrateAuth())).toMatchObject({
    isAuthenticated: true,
    loading: false,
    user: { id: 'user-1', email: 'user@example.test' },
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
