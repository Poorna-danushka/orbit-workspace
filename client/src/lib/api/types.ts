import type { InternalAxiosRequestConfig } from 'axios';

export interface OrbitRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _csrfRetry?: boolean;
  _rateLimitRetry?: boolean;
  silent?: boolean;
  skipAuthRefresh?: boolean;
  noRetry?: boolean;
}
