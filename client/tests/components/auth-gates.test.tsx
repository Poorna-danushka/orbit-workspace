import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import api from '@/lib/api/client';
import AuthGate from '@/features/auth/components/AuthGate';
import AdminGate from '@/features/auth/components/AdminGate';
import { markSessionActive } from '@/lib/auth/session';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

function response(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { config, data, headers: {}, status: 200, statusText: 'OK' };
}

describe('authorization gates', () => {
  let originalAdapter: typeof api.defaults.adapter;

  beforeEach(() => {
    originalAdapter = api.defaults.adapter;
    store.dispatch(logout());
    markSessionActive();
    mockReplace.mockClear();
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  test('verifies once and blocks a non-admin from administrator content', async () => {
    let profileRequests = 0;
    const adapter: AxiosAdapter = async (config) => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      if (path.endsWith('/user/me')) {
        profileRequests += 1;
        return response(config, {
          user: {
            id: 'user-1',
            username: 'Workspace User',
            email: 'user@example.test',
            role: 'user',
          },
        });
      }
      throw new Error(`Unexpected API request: ${path}`);
    };
    api.defaults.adapter = adapter;

    render(
      <Provider store={store}>
        <AuthGate>
          <div>Workspace content</div>
        </AuthGate>
        <AdminGate>
          <div>Administrator content</div>
        </AdminGate>
      </Provider>,
    );

    expect(await screen.findByText('Workspace content')).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    expect(screen.queryByText('Administrator content')).not.toBeInTheDocument();
    expect(profileRequests).toBe(1);
  });
});
