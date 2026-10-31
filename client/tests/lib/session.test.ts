import { redirectTo } from '@/lib/auth/navigate';

jest.mock('@/lib/auth/navigate', () => ({ redirectTo: jest.fn() }));

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];

  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;

  constructor(readonly name: string) {
    FakeBroadcastChannel.instances.push(this);
  }

  postMessage(data: unknown): void {
    for (const channel of FakeBroadcastChannel.instances) {
      if (channel !== this && channel.name === this.name) {
        channel.onmessage?.(new MessageEvent('message', { data }));
      }
    }
  }
}

test('a session-ended broadcast clears another tab without a second redirect', () => {
  const originalBroadcastChannel = Object.getOwnPropertyDescriptor(
    globalThis,
    'BroadcastChannel',
  );
  let senderEndSession: typeof import('@/lib/auth/session').endSession | undefined;
  let receiverSessionEnded = 0;
  const receiverRedirect = jest.mocked(redirectTo);
  receiverRedirect.mockClear();
  FakeBroadcastChannel.instances = [];

  Object.defineProperty(globalThis, 'BroadcastChannel', {
    configurable: true,
    value: FakeBroadcastChannel,
  });

  try {
    jest.isolateModules(() => {
      const session = jest.requireActual<typeof import('@/lib/auth/session')>('@/lib/auth/session');
      senderEndSession = session.endSession;
      session.markSessionActive();
    });
    jest.isolateModules(() => {
      const session = jest.requireActual<typeof import('@/lib/auth/session')>('@/lib/auth/session');
      const { sessionEvents } =
        jest.requireActual<typeof import('@/lib/auth/events')>('@/lib/auth/events');
      sessionEvents.on('session-ended', () => {
        receiverSessionEnded += 1;
      });
      session.markSessionActive();
    });

    if (!senderEndSession) throw new Error('Sender session module did not initialize.');
    senderEndSession('session-ended');

    expect(receiverSessionEnded).toBe(1);
    expect(receiverRedirect).toHaveBeenCalledTimes(1);
    expect(receiverRedirect).toHaveBeenCalledWith('/login?next=%2F');
  } finally {
    FakeBroadcastChannel.instances = [];
    if (originalBroadcastChannel) {
      Object.defineProperty(globalThis, 'BroadcastChannel', originalBroadcastChannel);
    } else {
      Reflect.deleteProperty(globalThis, 'BroadcastChannel');
    }
  }
});
