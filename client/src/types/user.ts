export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | string;
  avatar: string | null;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
