const configuredBackendUrl = process.env.NEXT_PUBLIC_SERVER_URL?.trim();

export const BACKEND_URL = configuredBackendUrl?.replace(/\/+$/, '') ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
export const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '';

export function getAvatarUrl(avatarPath: string | null | undefined): string {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  if (!BACKEND_URL) return avatarPath;
  return `${BACKEND_URL}${avatarPath}`;
}
