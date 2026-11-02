import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { isUserRole } from '@/types/user';

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
      const user = action.payload?.user;
      if (!user || !isUserRole(user.role)) {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        return;
      }
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
