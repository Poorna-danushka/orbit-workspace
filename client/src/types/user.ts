export type UserRole = 'admin' | 'user';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'user';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  createdAt?: string;
}
