import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import Login from '@/app/(public)/login/page';
import api from '@/lib/axios';
import { store } from '@/store';

const mockReplace = jest.fn();
const mockPost = jest.mocked(api.post);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/ui/ThemeToggle', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

function renderLogin() {
  return render(
    <Provider store={store}>
      <Login />
    </Provider>,
  );
}

async function enterCredentials() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Work Email'), 'user@example.test');
  await user.type(screen.getByLabelText('Password'), 'correct-horse-battery');
  return user;
}

beforeEach(() => {
  mockReplace.mockClear();
  mockPost.mockReset();
  window.localStorage.clear();
});

test('renders the sign-in form and requires both credentials', async () => {
  renderLogin();

  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(screen.getByLabelText('Work Email')).toBeRequired();
  expect(screen.getByLabelText('Password')).toBeRequired();
});

test('submits credentials and routes the authenticated user to their workspace', async () => {
  renderLogin();
  const user = await enterCredentials();
  mockPost.mockResolvedValueOnce({
    data: {
      user: {
        id: 'user-1',
        username: 'Orbit User',
        email: 'user@example.test',
        role: 'user',
      },
    },
  } as AxiosResponse);

  await user.click(screen.getByRole('button', { name: 'Sign In to Workspace' }));

  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
  expect(mockPost).toHaveBeenCalledWith('/auth/login', {
    email: 'user@example.test',
    password: 'correct-horse-battery',
  });
  expect(window.localStorage.getItem('userInfo')).toContain('user@example.test');
});

test('shows the backend authentication error without changing routes', async () => {
  renderLogin();
  const user = await enterCredentials();
  const error = new AxiosError('Request failed');
  error.response = {
    data: { message: 'Invalid credentials' },
  } as AxiosResponse;
  mockPost.mockRejectedValueOnce(error);
  await user.click(screen.getByRole('button', { name: 'Sign In to Workspace' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  expect(mockReplace).not.toHaveBeenCalled();
});
