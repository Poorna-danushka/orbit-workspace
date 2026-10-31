import { normalizeError } from './normalize';

export function getErrorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeError(error);
  if (normalized.isTimeout) return 'The request timed out. Please try again.';
  if (normalized.isNetwork) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  if (normalized.status === 429) {
    const seconds = normalized.retryAfter ?? 0;
    return seconds > 0
      ? `Too many requests. Please wait ${seconds} seconds and try again.`
      : 'Too many requests. Please wait a moment and try again.';
  }
  if (normalized.status === 403 && normalized.code === 'CSRF_INVALID') {
    return 'Security check failed. Please reload the page and try again.';
  }
  const fieldMessages = Object.values(normalized.fieldErrors);
  if (fieldMessages.length > 0) return fieldMessages.join(' ');
  if (normalized.status === 403) return 'You are not allowed to perform that action.';
  if (normalized.status === 404) return 'The requested resource could not be found.';
  if (normalized.message && normalized.message !== 'Something went wrong.') {
    return normalized.message;
  }
  return fallback;
}
