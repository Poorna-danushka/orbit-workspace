import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

const CSRF_TIMEOUT_MS = 8_000;

let tokenInMemory: string | null = null;
let tokenRequest: Promise<string> | null = null;
let forcedTokenRequest: Promise<string> | null = null;
let tokenGeneration = 0;

function getReadableCookie(): string {
  if (typeof document === 'undefined') return '';
  for (const cookie of document.cookie.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name !== 'csrfToken') continue;
    const value = valueParts.join('=');
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return '';
}

function requestCsrfToken(generation: number, forceRefresh: boolean): Promise<string> {
  const request = axios
    .get<{ csrfToken?: unknown }>(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true,
      timeout: CSRF_TIMEOUT_MS,
    })
    .then((response) => {
      const responseToken =
        typeof response.data?.csrfToken === 'string' ? response.data.csrfToken : '';
      const token = responseToken || getReadableCookie();
      if (generation === tokenGeneration) tokenInMemory = token || null;
      return token;
    })
    .catch((error: unknown) => {
      const cookieToken = getReadableCookie();
      if (generation === tokenGeneration) tokenInMemory = cookieToken || null;
      logger.warn('CSRF token fetch failed', {
        code: axios.isAxiosError(error) ? error.code : undefined,
      });
      return cookieToken;
    })
    .finally(() => {
      if (tokenRequest === request) tokenRequest = null;
      if (forcedTokenRequest === request) forcedTokenRequest = null;
    });

  tokenRequest = request;
  if (forceRefresh) forcedTokenRequest = request;
  return request;
}

export function getCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    if (forcedTokenRequest) return forcedTokenRequest;
    tokenGeneration += 1;
    tokenInMemory = null;
    tokenRequest = null;
    return requestCsrfToken(tokenGeneration, true);
  }
  if (tokenInMemory) return Promise.resolve(tokenInMemory);
  if (tokenRequest) return tokenRequest;
  return requestCsrfToken(tokenGeneration, false);
}

export function clearCsrfToken(): void {
  tokenGeneration += 1;
  tokenInMemory = null;
  tokenRequest = null;
  forcedTokenRequest = null;
}
