import { ROUTES } from '@/lib/constants/routes';

const PUBLIC_AUTH_PATHS = new Set<string>([
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
]);

export function getPostAuthPath(role: string, requestedPath?: string | null): string {
  if (role === 'admin') return ROUTES.adminDashboard;
  if (
    !requestedPath ||
    !requestedPath.startsWith('/') ||
    requestedPath.startsWith('//') ||
    requestedPath.includes('\\')
  ) {
    return ROUTES.dashboard;
  }

  let destination: URL;
  try {
    destination = new URL(requestedPath, 'https://orbit.local');
  } catch {
    return ROUTES.dashboard;
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(destination.pathname).toLowerCase();
  } catch {
    return ROUTES.dashboard;
  }

  if (
    destination.origin !== 'https://orbit.local' ||
    pathname.startsWith('//') ||
    pathname.includes('\\') ||
    pathname.startsWith('/admin') ||
    PUBLIC_AUTH_PATHS.has(pathname)
  ) {
    return '/dashboard';
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
