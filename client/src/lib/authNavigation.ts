const PUBLIC_AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

export function getPostAuthPath(role: string, requestedPath?: string | null): string {
  if (role === 'admin') return '/admin-dashboard';
  if (!requestedPath || !requestedPath.startsWith('/') || requestedPath.startsWith('//') || requestedPath.includes('\\')) {
    return '/dashboard';
  }

  let destination: URL;
  try {
    destination = new URL(requestedPath, 'https://orbit.local');
  } catch {
    return '/dashboard';
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(destination.pathname).toLowerCase();
  } catch {
    return '/dashboard';
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
