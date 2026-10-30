import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import api from '@/lib/api/client';
import { clearCsrfToken } from '@/lib/api/csrf';
import { markSessionActive } from '@/lib/auth/session';
import { sessionEvents } from '@/lib/auth/events';
import { getSessionRedirectUrl } from '@/lib/auth/redirect';

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return {
    config,
    data,
    headers: {},
    status,
    statusText: status === 200 ? 'OK' : 'Unauthorized',
  };
}

function unauthorized(config: InternalAxiosRequestConfig, code: string): AxiosError {
  return new AxiosError(
    'Request failed',
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    response(config, { code }, 401),
  );
}

function failure(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
  headers: Record<string, string> = {},
): AxiosError {
  return new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, undefined, {
    ...response(config, data, status),
    headers,
  });
}

describe('real API client auth refresh interceptors', () => {
  let originalInstanceAdapter: typeof api.defaults.adapter;
  let originalAxiosAdapter: typeof axios.defaults.adapter;

  beforeEach(() => {
    originalInstanceAdapter = api.defaults.adapter;
    originalAxiosAdapter = axios.defaults.adapter;
    clearCsrfToken();
    window.history.replaceState({}, '', '/login');
    markSessionActive();
  });

  afterEach(() => {
    api.defaults.adapter = originalInstanceAdapter;
    axios.defaults.adapter = originalAxiosAdapter;
    clearCsrfToken();
  });

  test('session redirect preserves the current location and avoids a login loop', () => {
    expect(getSessionRedirectUrl('/projects?filter=mine')).toBe(
      '/login?next=%2Fprojects%3Ffilter%3Dmine',
    );
    expect(getSessionRedirectUrl('/login?next=%2Fprojects')).toBeUndefined();
  });

  test('three parallel expired-token requests share a refresh and replay successfully', async () => {
    const requestCounts = new Map<string, number>();
    let refreshCount = 0;
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      requestCounts.set(path, (requestCounts.get(path) ?? 0) + 1);

      if (path.endsWith('/csrf-token')) {
        return response(config, { csrfToken: 'csrf-test-token' });
      }
      if (path.endsWith('/auth/refresh')) {
        refreshCount += 1;
        return response(config, { message: 'refreshed' });
      }
      if (path.endsWith('/fixture')) {
        const count = requestCounts.get(path) ?? 0;
        if (count <= 3) throw unauthorized(config, 'AUTH_TOKEN_EXPIRED');
        return response(config, { ok: true });
      }
      throw new Error(`Unexpected API request: ${path}`);
    };

    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    const results = await Promise.all([
      api.get('/fixture'),
      api.get('/fixture'),
      api.get('/fixture'),
    ]);

    expect(refreshCount).toBe(1);
    expect(
      [...requestCounts.entries()]
        .filter(([path]) => path.endsWith('/fixture'))
        .reduce((count, [, requests]) => count + requests, 0),
    ).toBe(6);
    expect(results.map(({ data }) => data.ok)).toEqual([true, true, true]);
  });

  test('independent tabs serialize refresh requests through the Web Locks API', async () => {
    type LockCallback<T> = (lock: Lock | null) => Promise<T>;
    let lockQueue = Promise.resolve();
    let activeRefreshes = 0;
    let maxActiveRefreshes = 0;
    let refreshCount = 0;

    const requestLock = async <T>(
      _name: string,
      _options: LockOptions,
      callback: LockCallback<T>,
    ): Promise<T> => {
      const previousLock = lockQueue;
      let releaseLock = () => {};
      lockQueue = new Promise<void>((resolve) => {
        releaseLock = resolve;
      });
      await previousLock;
      try {
        return await callback(null);
      } finally {
        releaseLock();
      }
    };

    const previousLocks = Object.getOwnPropertyDescriptor(navigator, 'locks');
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: requestLock },
    });

    let firstTabRefresh: typeof import('@/lib/api/refresh').refreshSession | undefined;
    let secondTabRefresh: typeof import('@/lib/api/refresh').refreshSession | undefined;
    jest.isolateModules(() => {
      firstTabRefresh =
        jest.requireActual<typeof import('@/lib/api/refresh')>('@/lib/api/refresh').refreshSession;
    });
    jest.isolateModules(() => {
      secondTabRefresh =
        jest.requireActual<typeof import('@/lib/api/refresh')>('@/lib/api/refresh').refreshSession;
    });
    if (!firstTabRefresh || !secondTabRefresh) {
      throw new Error('Refresh service could not be loaded in isolated tab contexts.');
    }

    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) {
        return response(config, { csrfToken: 'lock-csrf-token' });
      }
      if (path.endsWith('/auth/refresh')) {
        refreshCount += 1;
        activeRefreshes += 1;
        maxActiveRefreshes = Math.max(maxActiveRefreshes, activeRefreshes);
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
        activeRefreshes -= 1;
        return response(config, { message: 'refreshed' });
      }
      throw new Error(`Unexpected API request: ${path}`);
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    try {
      await Promise.all([firstTabRefresh(api), secondTabRefresh(api)]);
      expect(refreshCount).toBe(2);
      expect(maxActiveRefreshes).toBe(1);
    } finally {
      if (previousLocks) Object.defineProperty(navigator, 'locks', previousLocks);
      else Reflect.deleteProperty(navigator, 'locks');
    }
  });

  test('a missing-token response refreshes and replays the original request once', async () => {
    let protectedRequests = 0;
    let refreshCount = 0;
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) {
        return response(config, { csrfToken: 'csrf-test-token' });
      }
      if (path.endsWith('/auth/refresh')) {
        refreshCount += 1;
        return response(config, { message: 'refreshed' });
      }
      if (path.endsWith('/missing-token-fixture')) {
        protectedRequests += 1;
        if (protectedRequests === 1) throw unauthorized(config, 'AUTH_TOKEN_MISSING');
        return response(config, { ok: true });
      }
      throw new Error(`Unexpected API request: ${path}`);
    };

    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    const result = await api.get('/missing-token-fixture');

    expect(refreshCount).toBe(1);
    expect(protectedRequests).toBe(2);
    expect(result.data.ok).toBe(true);
  });

  test.each(['AUTH_REFRESH_MISSING', 'AUTH_REFRESH_EXPIRED', 'AUTH_REFRESH_INVALID'])(
    'a refresh failure with %s ends the session once',
    async (code) => {
      let refreshCount = 0;
      let endEvents = 0;
      const unsubscribe = sessionEvents.on('session-ended', () => {
        endEvents += 1;
      });
      const adapter: AxiosAdapter = async (config) => {
        const path = new URL(config.url ?? '', config.baseURL).pathname;
        if (path.endsWith('/csrf-token')) return response(config, { csrfToken: 'csrf-token' });
        if (path.endsWith('/auth/refresh')) {
          refreshCount += 1;
          throw unauthorized(config, code);
        }
        if (path.endsWith('/refresh-failure-fixture')) {
          throw unauthorized(config, 'AUTH_TOKEN_EXPIRED');
        }
        throw new Error(`Unexpected API request: ${path}`);
      };
      api.defaults.adapter = adapter;
      axios.defaults.adapter = adapter;

      try {
        await expect(api.get('/refresh-failure-fixture')).rejects.toMatchObject({
          apiError: { code },
        });
        expect(refreshCount).toBe(1);
        expect(endEvents).toBe(1);
      } finally {
        unsubscribe();
      }
    },
  );

  test.each(['AUTH_TOKEN_INVALID', 'AUTH_USER_NOT_FOUND'])(
    '%s ends the session without refreshing',
    async (code) => {
      let refreshCount = 0;
      let endEvents = 0;
      const unsubscribe = sessionEvents.on('session-ended', () => {
        endEvents += 1;
      });
      const adapter: AxiosAdapter = async (config) => {
        const path = new URL(config.url ?? '', config.baseURL).pathname;
        if (path.endsWith('/csrf-token')) return response(config, { csrfToken: 'csrf-token' });
        if (path.endsWith('/auth/refresh')) refreshCount += 1;
        throw unauthorized(config, code);
      };
      api.defaults.adapter = adapter;
      axios.defaults.adapter = adapter;

      try {
        await expect(api.get('/invalid-token-fixture')).rejects.toMatchObject({
          apiError: { code },
        });
        expect(refreshCount).toBe(0);
        expect(endEvents).toBe(1);
      } finally {
        unsubscribe();
      }
    },
  );

  test('a replayed request that still receives 401 is not refreshed twice', async () => {
    let protectedRequests = 0;
    let refreshCount = 0;
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) return response(config, { csrfToken: 'csrf-token' });
      if (path.endsWith('/auth/refresh')) {
        refreshCount += 1;
        return response(config, { refreshed: true });
      }
      if (path.endsWith('/replay-failure-fixture')) {
        protectedRequests += 1;
        throw unauthorized(config, 'AUTH_TOKEN_EXPIRED');
      }
      throw new Error(`Unexpected API request: ${path}`);
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    await expect(api.get('/replay-failure-fixture')).rejects.toMatchObject({
      apiError: { code: 'AUTH_TOKEN_EXPIRED' },
    });
    expect(refreshCount).toBe(1);
    expect(protectedRequests).toBe(2);
  });

  test.each([
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ])('does not refresh an expired-token response from %s', async (path) => {
    let refreshCount = 0;
    const adapter: AxiosAdapter = async (config) => {
      const requestPath = new URL(config.url ?? '', config.baseURL).pathname;
      if (requestPath.endsWith('/csrf-token')) return response(config, { csrfToken: 'csrf-token' });
      if (requestPath.endsWith('/auth/refresh')) refreshCount += 1;
      throw unauthorized(config, 'AUTH_TOKEN_EXPIRED');
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    await expect(api.post(path, {})).rejects.toMatchObject({
      apiError: { code: 'AUTH_TOKEN_EXPIRED' },
    });
    expect(refreshCount).toBe(0);
  });

  test('retries one CSRF_INVALID response with a newly fetched token only once', async () => {
    let csrfRequests = 0;
    let protectedRequests = 0;
    const observedTokens: unknown[] = [];
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) {
        csrfRequests += 1;
        return response(config, { csrfToken: `csrf-${csrfRequests}` });
      }
      if (path.endsWith('/csrf-fixture')) {
        protectedRequests += 1;
        observedTokens.push(config.headers.get('X-CSRF-Token'));
        if (protectedRequests === 1) throw failure(config, 403, { code: 'CSRF_INVALID' });
        return response(config, { ok: true });
      }
      throw new Error(`Unexpected API request: ${path}`);
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    const result = await api.post('/csrf-fixture', {});
    expect(result.data.ok).toBe(true);
    expect(csrfRequests).toBe(2);
    expect(protectedRequests).toBe(2);
    expect(observedTokens).toEqual(['csrf-1', 'csrf-2']);
  });

  test('does not retry CSRF_INVALID a second time', async () => {
    let protectedRequests = 0;
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) return response(config, { csrfToken: 'csrf-token' });
      if (path.endsWith('/csrf-retry-limit')) {
        protectedRequests += 1;
        throw failure(config, 403, { code: 'CSRF_INVALID' });
      }
      throw new Error(`Unexpected API request: ${path}`);
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    await expect(api.post('/csrf-retry-limit', {})).rejects.toMatchObject({
      apiError: { code: 'CSRF_INVALID' },
    });
    expect(protectedRequests).toBe(2);
  });

  test('mutations use the in-memory CSRF token while GET requests do not', async () => {
    let csrfRequests = 0;
    const mutationTokens: unknown[] = [];
    const getTokens: unknown[] = [];
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) {
        csrfRequests += 1;
        return response(config, { csrfToken: 'memory-only-token' });
      }
      if (path.endsWith('/csrf-mutation')) mutationTokens.push(config.headers.get('X-CSRF-Token'));
      if (path.endsWith('/csrf-read')) getTokens.push(config.headers.get('X-CSRF-Token'));
      return response(config, { ok: true });
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    await api.post('/csrf-mutation', {});
    await api.get('/csrf-read');
    expect(csrfRequests).toBe(1);
    expect(mutationTokens).toEqual(['memory-only-token']);
    expect(getTokens).toEqual([undefined]);
  });

  test('FormData upload leaves Content-Type to the browser and includes CSRF', async () => {
    let uploadContentType: unknown;
    let uploadCsrfToken: unknown;
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) return response(config, { csrfToken: 'upload-csrf-token' });
      if (path.endsWith('/upload-fixture')) {
        uploadContentType = config.headers.get('Content-Type');
        uploadCsrfToken = config.headers.get('X-CSRF-Token');
      }
      return response(config, { ok: true });
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    const formData = new FormData();
    formData.append('file', new Blob(['sample'], { type: 'text/plain' }), 'sample.txt');
    await api.post('/upload-fixture', formData);

    expect(uploadContentType).toBe(false);
    expect(uploadCsrfToken).toBe('upload-csrf-token');
  });

  test.each([
    ['network failure', () => new AxiosError('Network Error', 'ERR_NETWORK'), 'NETWORK_ERROR'],
    ['timeout', () => new AxiosError('timeout', 'ECONNABORTED'), 'TIMEOUT'],
    [
      'server error',
      (config: InternalAxiosRequestConfig) => failure(config, 500, { message: 'down' }),
      undefined,
    ],
  ])('%s keeps the session and attaches apiError', async (_label, errorFactory, code) => {
    let endEvents = 0;
    const unsubscribe = sessionEvents.on('session-ended', () => {
      endEvents += 1;
    });
    const adapter: AxiosAdapter = async (config) => {
      const error = errorFactory(config);
      throw error;
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    try {
      await expect(api.get('/transient-fixture')).rejects.toMatchObject({
        apiError: code ? { code } : { status: 500 },
      });
      expect(endEvents).toBe(0);
    } finally {
      unsubscribe();
    }
  });

  test('GET 429 honors Retry-After once and does not end the session', async () => {
    let requests = 0;
    let endEvents = 0;
    const unsubscribe = sessionEvents.on('session-ended', () => {
      endEvents += 1;
    });
    const adapter: AxiosAdapter = async (config) => {
      requests += 1;
      if (requests === 1)
        throw failure(config, 429, { message: 'Slow down' }, { 'Retry-After': '0' });
      return response(config, { ok: true });
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    try {
      const result = await api.get('/rate-limit-fixture');
      expect(result.data.ok).toBe(true);
      expect(requests).toBe(2);
      expect(endEvents).toBe(0);
    } finally {
      unsubscribe();
    }
  });

  test('a repeated GET 429 returns a normalized error without ending the session', async () => {
    let requests = 0;
    let endEvents = 0;
    const unsubscribe = sessionEvents.on('session-ended', () => {
      endEvents += 1;
    });
    const adapter: AxiosAdapter = async (config) => {
      requests += 1;
      throw failure(config, 429, { message: 'Slow down' }, { 'Retry-After': '0' });
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    try {
      await expect(api.get('/rate-limit-retry-limit')).rejects.toMatchObject({
        apiError: { status: 429 },
      });
      expect(requests).toBe(2);
      expect(endEvents).toBe(0);
    } finally {
      unsubscribe();
    }
  });
});
