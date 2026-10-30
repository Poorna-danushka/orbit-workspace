import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) {
        return;
      }

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    rehydrateAuth: (state) => {
      const rawUser =
        typeof window !== 'undefined' ? window.localStorage.getItem('userInfo') : null;

      if (!rawUser) {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        return;
      }

      try {
        const parsed = JSON.parse(rawUser) as Partial<User> | null;

        if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
          state.user = {
            id: parsed.id,
            username: parsed.username ?? '',
            email: parsed.email,
            role: parsed.role ?? 'user',
            avatar: parsed.avatar ?? null,
            createdAt: parsed.createdAt,
          };
          state.isAuthenticated = true;
          state.loading = false;
          return;
        }
      } catch {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        return;
      }

      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { setCredentials, updateUser, setLoading, rehydrateAuth, logout } = authSlice.actions;
export default authSlice.reducer;
