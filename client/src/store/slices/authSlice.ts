/**
 * User Authentication Redux Slice
 * 
 * Manages user authentication state including:
 * - Current user information
 * - Access token for API requests
 * - Authentication status
 * - Session rehydration from cookies
 * 
 * @module authSlice
 * @see {@link setCredentials} Update user and token
 * @see {@link logout} Clear user session
 * @see {@link rehydrateAuth} Restore session from cookies
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearAuthTokens, getStoredUser } from '@/lib/tokenStorage';

/**
 * User information stored in Redux and cookies
 * 
 * @interface User
 * @property {string} id - Unique user identifier
 * @property {string} username - Display name
 * @property {string} email - User email address
 * @property {string} role - User role (user | admin)
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
}

export interface AuthState {
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
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      if (typeof window !== 'undefined') {
        clearAuthTokens();
      }
    },
    rehydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        const user = getStoredUser();
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
        }
        state.loading = false;
      }
    },
  },
});

export const { setCredentials, updateUser, setLoading, logout, rehydrateAuth } = authSlice.actions;
export default authSlice.reducer;

