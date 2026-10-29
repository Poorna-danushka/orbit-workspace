import { logger } from '@/lib/utils/logger';
import { normalizeError } from './normalize';

export function reportError(error: unknown, event = 'API request failed'): void {
  const normalized = normalizeError(error);
  logger.error(event, {
    code: normalized.code,
    requestId: normalized.requestId,
    status: normalized.status,
  });
}
