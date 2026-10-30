import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { io, type Socket } from 'socket.io-client';
import api from '@/lib/api/client';
import { acquireSocket, releaseSocket } from '@/lib/realtime/socket';
import { markSessionActive } from '@/lib/auth/session';
import { sessionEvents } from '@/lib/auth/events';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

class FakeSocket {
  readonly handlers = new Map<string, (error?: unknown) => void>();
  connect = jest.fn();
  disconnect = jest.fn();

  on(event: string, handler: (error?: unknown) => void): this {
    this.handlers.set(event, handler);
    return this;
  }

  trigger(event: string, error?: unknown): void {
    this.handlers.get(event)?.(error);
  }
}

function response(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { config, data, headers: {}, status: 200, statusText: 'OK' };
}

function unauthorized(config: InternalAxiosRequestConfig, code: string): AxiosError {
  return new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, undefined, {
    ...response(config, { code }),
    status: 401,
    statusText: 'Unauthorized',
  });
}

describe('socket authentication refresh', () => {
  let originalInstanceAdapter: typeof api.defaults.adapter;
  let originalAxiosAdapter: typeof axios.defaults.adapter;
  let socket: FakeSocket;

  beforeEach(() => {
    originalInstanceAdapter = api.defaults.adapter;
    originalAxiosAdapter = axios.defaults.adapter;
    socket = new FakeSocket();
    jest.mocked(io).mockReturnValue(socket as unknown as Socket);
    window.history.replaceState({}, '', '/login');
    markSessionActive();
  });

  afterEach(() => {
    releaseSocket();
    api.defaults.adapter = originalInstanceAdapter;
    axios.defaults.adapter = originalAxiosAdapter;
    jest.mocked(io).mockReset();
  });

  test.each(['AUTH_TOKEN_EXPIRED', 'AUTH_TOKEN_MISSING'])(
    '%s shares one refresh and reconnects once',
    async (code) => {
      let refreshRequests = 0;
      const adapter: AxiosAdapter = async (config) => {
        const path = new URL(config.url ?? '', config.baseURL).pathname;
        if (path.endsWith('/csrf-token')) {
          return response(config, { csrfToken: 'socket-csrf-token' });
        }
        if (path.endsWith('/auth/refresh')) {
          refreshRequests += 1;
          return response(config, { message: 'refreshed' });
        }
        throw new Error(`Unexpected API request: ${path}`);
      };
      api.defaults.adapter = adapter;
      axios.defaults.adapter = adapter;

      acquireSocket();
      socket.trigger('connect_error', { code });
      socket.trigger('connect_error', { code });

      await new Promise<void>((resolve) => {
        const check = () => {
          if (socket.connect.mock.calls.length === 1) resolve();
          else setTimeout(check, 0);
        };
        check();
      });

      expect(refreshRequests).toBe(1);
      expect(socket.connect).toHaveBeenCalledTimes(1);
    },
  );

  test('refresh failure ends the session once', async () => {
    let endEvents = 0;
    const unsubscribe = sessionEvents.on('session-ended', () => {
      endEvents += 1;
    });
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/csrf-token')) {
        return response(config, { csrfToken: 'socket-csrf-token' });
      }
      if (path.endsWith('/auth/refresh')) {
        throw unauthorized(config, 'AUTH_REFRESH_EXPIRED');
      }
      throw new Error(`Unexpected API request: ${path}`);
    };
    api.defaults.adapter = adapter;
    axios.defaults.adapter = adapter;

    acquireSocket();
    socket.trigger('connect_error', { code: 'AUTH_TOKEN_MISSING' });

    await new Promise<void>((resolve) => {
      const check = () => {
        if (endEvents === 1) resolve();
        else setTimeout(check, 0);
      };
      check();
    });

    expect(endEvents).toBe(1);
    expect(socket.connect).not.toHaveBeenCalled();
    unsubscribe();
  });
});
