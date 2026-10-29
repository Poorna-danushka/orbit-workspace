import { normalizeError } from '@/lib/errors';

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeError(error);
  const firstFieldMessage = Object.values(normalized.fieldErrors)[0];
  return firstFieldMessage || normalized.message || fallback;
}
