const configuredBackendUrl = process.env.NEXT_PUBLIC_SERVER_URL?.trim();

export const BACKEND_URL =
  configuredBackendUrl?.replace(/\/+$/, '') ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
export const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '';

export function getUploadUrl(path: string): string {
  return path.startsWith('/api/uploads/') ? `${BACKEND_URL}${path}` : path;
}
