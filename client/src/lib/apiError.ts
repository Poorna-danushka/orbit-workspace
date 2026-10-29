import { normalizeError } from '@/lib/errors';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeError(error);
  if (normalized.message) return normalized.message;
  return fallback;
}
