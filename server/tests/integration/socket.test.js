const http = require('node:http');
const { once } = require('node:events');
const { io: createClient } = require('socket.io-client');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const { generateAccessToken } = require('../../src/utils/token.util');
const { initSocket } = require('../../src/sockets/socketManager');

const userId = '507f1f77bcf86cd799439011';
const allowedProjectId = '507f1f77bcf86cd799439012';
const deniedProjectId = '507f1f77bcf86cd799439013';
const connectedClients = new Set();
let httpServer;
let socketServer;
let socketUrl;

const connectClient = (token) => {
  const client = createClient(socketUrl, {
    transports: ['websocket'],
    reconnection: false,
    ...(token ? { extraHeaders: { Cookie: `accessToken=${token}` } } : {}),
  });
  connectedClients.add(client);
  return client;
};

beforeAll(async () => {
  jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: userId });
  jest.spyOn(prisma.project, 'findFirst').mockImplementation(async ({ where }) => (
    where.id === allowedProjectId ? { id: allowedProjectId } : null
  ));
  jest.spyOn(prisma.message, 'create').mockImplementation(async ({ data }) => ({
    id: '507f1f77bcf86cd799439014',
    ...data,
    sender: { id: userId, username: 'Orbit User', avatar: null },
  }));

  httpServer = http.createServer(app);
  socketServer = initSocket(httpServer);
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  socketUrl = `http://127.0.0.1:${httpServer.address().port}`;
});

afterAll(async () => {
  for (const client of connectedClients) client.disconnect();
  await new Promise((resolve) => socketServer.close(resolve));
  jest.restoreAllMocks();
});

test('rejects a connection without an authenticated session cookie', async () => {
  const client = connectClient();
  const [error] = await once(client, 'connect_error');

  expect(error.message).toBe('Authentication required');
});

test('authenticates users, enforces project-room access, and broadcasts real chat messages', async () => {
  const token = generateAccessToken({ id: userId, role: 'user' });
  const client = connectClient(token);
  await once(client, 'connect');

  const deniedJoin = new Promise((resolve) => {
    client.emit('joinProject', deniedProjectId, resolve);
  });
  await expect(deniedJoin).resolves.toEqual({ error: 'Project access denied' });

  const allowedJoin = new Promise((resolve) => {
    client.emit('joinProject', allowedProjectId, resolve);
  });
  await expect(allowedJoin).resolves.toEqual({ ok: true });

  const receivedMessage = once(client, 'messageReceived');
  const sentMessage = new Promise((resolve) => {
    client.emit('sendMessage', {
      projectId: allowedProjectId,
      content: '  Socket integration test  ',
    }, resolve);
  });

  await expect(sentMessage).resolves.toEqual({ ok: true });
  const [message] = await receivedMessage;
  expect(message).toMatchObject({
    projectId: allowedProjectId,
    senderId: userId,
    content: 'Socket integration test',
  });
  expect(prisma.message.create).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({
      projectId: allowedProjectId,
      senderId: userId,
      content: 'Socket integration test',
    }),
  }));
});
