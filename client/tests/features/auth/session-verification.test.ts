import { getCurrentUser } from '@/features/auth/services/authService';
import { saveUserMetadata } from '@/lib/auth/storage';
import { sessionEvents } from '@/lib/auth/events';
import { verifyCurrentSession } from '@/features/auth/services/sessionVerification';

jest.mock('@/features/auth/services/authService', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('@/lib/auth/storage', () => ({
  saveUserMetadata: jest.fn(),
}));

const userFixture = (role: unknown) => ({
  id: 'user-1',
  username: 'Orbit User',
  email: 'user@example.test',
  role,
});

beforeEach(() => {
  sessionEvents.emit('session-started');
  jest.clearAllMocks();
});

test.each(['admin', 'user'])('session restoration accepts exact role %s', async (role) => {
  const user = userFixture(role);
  jest.mocked(getCurrentUser).mockResolvedValue({ data: { user } } as never);

  await expect(verifyCurrentSession()).resolves.toEqual(user);
  expect(saveUserMetadata).toHaveBeenCalledWith(user);
});

test.each(['ADMIN', 'USER', 'Admin', 'User', 'unknown', '', null, undefined, 1])(
  'session restoration rejects unsupported role %s',
  async (role) => {
    jest.mocked(getCurrentUser).mockResolvedValue({ data: { user: userFixture(role) } } as never);

    await expect(verifyCurrentSession()).rejects.toThrow(
      'Authenticated user profile is unavailable.',
    );
    expect(saveUserMetadata).not.toHaveBeenCalled();
  },
);
