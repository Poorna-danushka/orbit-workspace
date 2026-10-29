import type { AxiosError } from 'axios';
import axios from 'axios';
import { ErrorCode } from './codes';
import type { ApiError, ApiFieldError } from './types';

function parseFieldErrors(raw: unknown): Record<string, string> {
  if (!Array.isArray(raw)) return {};

  const fieldErrors: Record<string, string> = {};
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<ApiFieldError>;
    const field = candidate.field ?? candidate.path ?? candidate.fieldName;
    const message = candidate.message;
    if (field && message) fieldErrors[String(field)] = String(message);
  }

  return fieldErrors;
}

function getValidationMessage(raw: unknown): string {
  if (!Array.isArray(raw)) return '';
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const candidate = item as Partial<ApiFieldError>;
      const message = candidate.message;
      return typeof message === 'string' ? message : '';
    })
    .filter(Boolean)
    .join(' ');
}

function getRetryAfter(error: AxiosError): number | undefined {
  const value =
    error.response?.headers?.['Retry-After'] ?? error.response?.headers?.['retry-after'];
  if (typeof value !== 'string') return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

export function normalizeError(input: unknown): ApiError {
  const base: Partial<ApiError> = {
    name: 'ApiError',
    message: 'Something went wrong.',
    fieldErrors: {},
  };

  if (
    typeof input === 'object' &&
    input !== null &&
    'apiError' in input &&
    input.apiError &&
    input.apiError !== input
  ) {
    return normalizeError(input.apiError);
  }

  if (!input) {
    return Object.assign(new Error(base.message), base, { status: 500, code: ErrorCode.INTERNAL_ERROR, fieldErrors: {} }) as ApiError;
  }

  const axiosError = axios.isAxiosError(input) ? input : undefined;

  if (axiosError && axiosError.response) {
    const status = axiosError.response.status;
    const body = (axiosError.response.data ?? {}) as Record<string, unknown>;
    const code = (body.code as string | undefined) ?? (body.error as string | undefined) ?? undefined;
    const fieldErrors = parseFieldErrors(body.errors ?? (body as { fieldErrors?: unknown }).fieldErrors);
    const requestId = (body.requestId as string | undefined) ?? (axiosError.response.headers?.['x-request-id'] as string | undefined) ?? (axiosError.response.headers?.['X-Request-Id'] as string | undefined);

    const message =
      getValidationMessage(body.errors) ||
      (typeof body.message === 'string'
        ? body.message
        : typeof body.error === 'string'
          ? body.error
          : axiosError.message || 'Something went wrong.');

    return Object.assign(new Error(message), base, {
      status,
      code,
      message,
      fieldErrors,
      requestId,
      retryAfter: getRetryAfter(axiosError),
      isServer: status >= 500,
      isTimeout: axiosError.code === 'ECONNABORTED',
      isNetwork: !axiosError.response,
      raw: input,
    }) as ApiError;
  }

  if (axiosError && !axiosError.response) {
    const isTimeout = axiosError.code === 'ECONNABORTED' || axiosError.message.toLowerCase().includes('timeout');
    return Object.assign(new Error(axiosError.message || 'Network error'), base, {
      status: 0,
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: axiosError.message || 'Unable to reach the server.',
      fieldErrors: {},
      isNetwork: true,
      isTimeout,
      raw: input,
    }) as ApiError;
  }

  if (typeof input === 'object' && input !== null) {
    const candidate = input as Partial<ApiError> & Record<string, unknown>;
    const status = typeof candidate.status === 'number' ? candidate.status : 500;
    const message = typeof candidate.message === 'string' ? candidate.message : 'Something went wrong.';
    const fieldErrors = parseFieldErrors(candidate.errors ?? candidate.fieldErrors);
    const requestId = typeof candidate.requestId === 'string' ? candidate.requestId : undefined;
    return Object.assign(new Error(message), base, {
      status,
      code: typeof candidate.code === 'string' ? candidate.code : undefined,
      message,
      fieldErrors,
      requestId,
      retryAfter: typeof candidate.retryAfter === 'number' ? candidate.retryAfter : undefined,
      raw: input,
    }) as ApiError;
  }

  if (input instanceof Error) {
    return Object.assign(input, base, { status: 500, code: ErrorCode.INTERNAL_ERROR, fieldErrors: {}, message: input.message || base.message }) as ApiError;
  }

  const message = String(input);
  return Object.assign(new Error(message), base, { status: 500, code: ErrorCode.INTERNAL_ERROR, fieldErrors: {} }) as ApiError;
}
