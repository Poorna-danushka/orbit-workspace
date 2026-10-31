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

  let pathname = destination.pathname;
  try {
    while (true) {
      const decodedPathname = decodeURIComponent(pathname);
      if (decodedPathname === pathname) break;
      pathname = decodedPathname;
    }
  } catch {
    return ROUTES.dashboard;
  }
  pathname = pathname.toLowerCase();

  if (
    destination.origin !== 'https://orbit.local' ||
    pathname.startsWith('//') ||
    pathname.includes('\\') ||
    pathname.startsWith('/admin') ||
    PUBLIC_AUTH_PATHS.has(pathname)
  ) {
    return ROUTES.dashboard;
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function getSessionRedirectUrl(currentPath: string): string | undefined {
  if (currentPath.startsWith(ROUTES.login)) return undefined;
  const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : '';
  return `${ROUTES.login}${next}`;
}
