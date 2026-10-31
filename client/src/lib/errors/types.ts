export interface ApiFieldError {
  field?: string;
  path?: string;
  fieldName?: string;
  message?: string;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  message: string;
  fieldErrors: Record<string, string>;
  requestId?: string;
  retryAfter?: number;
  isNetwork?: boolean;
  isTimeout?: boolean;
  isServer?: boolean;
  raw?: unknown;
}
