import { toast } from 'sonner';
import { normalizeError } from './normalize';
import { getErrorMessage } from './messages';

export function notifyError(
  error: unknown,
  fallback = 'Something went wrong.',
  options?: { description?: string; id?: string },
) {
  const apiError = normalizeError(error);
  const duration = apiError.status === 429 && apiError.retryAfter ? 5000 : 4000;
  const body = getErrorMessage(apiError, fallback);

  return toast.error(body || fallback, {
    id:
      options?.id ??
      `error:${apiError.code ?? apiError.status ?? 'unknown'}:${apiError.requestId ?? 'no-request'}`,
    description: apiError.requestId ? `Reference: ${apiError.requestId}` : options?.description,
    duration,
  });
}
