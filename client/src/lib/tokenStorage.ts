/**
 * User Metadata Storage & Cookie Helpers
 *
 * Manages non-sensitive user metadata in browser cookies/localStorage.
 * Authentication tokens (JWT access & refresh tokens) are managed exclusively
 * by the server via HttpOnly cookies and are never accessible from JavaScript.
 *
 * @module tokenStorage
 */

const isBrowser = typeof window !== 'undefined';

/**
 * Get cookie value by name (e.g. csrfToken, userInfo)
 */
export const getCookie = (name: string): string | null => {
  if (!isBrowser) return null;
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

/**
 * Set a cookie
 */
export const setCookie = (name: string, value: string, days = 7) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(name, value);
  } catch {}
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secure = isHttps ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

/**
 * Remove a cookie
 */
export const removeCookie = (name: string) => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(name);
  } catch {}
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

/** Safely parse JSON */
const jsonParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
}

/**
 * Save non-sensitive user metadata for instant UI hydration.
 */
export const saveAuthTokens = (user: StoredUser | null) => {
  if (user) {
    removeCookie('adminInfo');
    removeCookie('userInfo');
    setCookie('userInfo', JSON.stringify(user), 7);
  }
};

/**
 * Clear auth user metadata.
 */
export const clearAuthTokens = () => {
  removeCookie('userInfo');
  removeCookie('adminInfo');
};

/**
 * Get stored user metadata from localStorage or cookies.
 */
export const getStoredUser = (): StoredUser | null => {
  if (isBrowser) {
    try {
      const local = localStorage.getItem('userInfo') || localStorage.getItem('adminInfo');
      if (local) {
        const parsed = jsonParse<StoredUser>(local);
        if (parsed) return parsed;
      }
    } catch {}
  }
  return jsonParse<StoredUser>(getCookie('userInfo')) ||
         jsonParse<StoredUser>(getCookie('adminInfo'));
};

/**
 * Check if the stored user has admin role
 */
export const isAdminSession = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'admin';
};
