const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const cleanupTestUsers = require('../helpers/cleanup-test-users');

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const databaseTest = testDatabaseUrl ? test : test.skip;
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = 'Orbit-integration-password-123';
const ownerEmail = `orbit-db-owner-${runId}@example.test`;
const otherEmail = `orbit-db-other-${runId}@example.test`;
let databaseConnected = false;

async function createAuthenticatedUser(username, email) {
  const agent = request.agent(app);
  const registration = await agent.post('/api/auth/register').send({
    username,
    email,
    password,
  });

  expect(registration.status).toBe(201);
  expect(registration.body.user).toMatchObject({ email, role: 'user' });

  const login = await agent.post('/api/auth/login').send({ email, password });
  expect(login.status).toBe(200);

  const csrf = await agent.get('/api/csrf-token');
  expect(csrf.status).toBe(200);

  const profile = await agent.get('/api/user/me');
  expect(profile.status).toBe(200);
  expect(profile.body.user).toMatchObject({ id: registration.body.user.id, email });

  return { agent, csrfToken: csrf.body.csrfToken, user: registration.body.user };
}

beforeAll(async () => {
  if (!testDatabaseUrl) return;

  const parsedUrl = new URL(testDatabaseUrl);
  const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1).split('/')[0] || '');
  if (!['mongodb:', 'mongodb+srv:'].includes(parsedUrl.protocol) || databaseName !== 'orbit_test') {
    throw new Error('Database integration tests require TEST_DATABASE_URL to target the orbit_test database');
  }

  await prisma.$connect();
  databaseConnected = true;
}, 60_000);

afterAll(async () => {
  if (!databaseConnected) return;
  try {
    await cleanupTestUsers(prisma, [ownerEmail, otherEmail]);
  } finally {
    await prisma.$disconnect();
  }
}, 60_000);

databaseTest(
  'registers and authenticates users, creates and updates a project task, and enforces project access',
  async () => {
    const owner = await createAuthenticatedUser('Orbit DB Owner', ownerEmail);

    const projectResponse = await owner.agent
      .post('/api/projects')
      .set('X-CSRF-Token', owner.csrfToken)
      .send({ title: `Database workflow ${runId}`, description: 'Created through Express and Prisma' });
    expect(projectResponse.status).toBe(201);
    expect(projectResponse.body).toMatchObject({
      title: `Database workflow ${runId}`,
      ownerId: owner.user.id,
      _count: { tasks: 0 },
    });
    const projectId = projectResponse.body.id;

    const taskResponse = await owner.agent
      .post('/api/tasks')
      .set('X-CSRF-Token', owner.csrfToken)
      .send({ projectId, title: `Initial task ${runId}`, status: 'Todo', priority: 'High' });
    expect(taskResponse.status).toBe(201);
    const taskId = taskResponse.body.id;

    const taskList = await owner.agent.get(`/api/tasks/project/${projectId}`);
    expect(taskList.status).toBe(200);
    expect(taskList.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: taskId, title: `Initial task ${runId}`, status: 'Todo' }),
    ]));

    const updatedTask = await owner.agent
      .put(`/api/tasks/${taskId}`)
      .set('X-CSRF-Token', owner.csrfToken)
      .send({ title: `Updated task ${runId}` });
    expect(updatedTask.status).toBe(200);
    expect(updatedTask.body).toMatchObject({ id: taskId, title: `Updated task ${runId}`, status: 'Todo' });

    const otherUser = await createAuthenticatedUser('Orbit DB Other', otherEmail);
    const forbiddenTasks = await otherUser.agent.get(`/api/tasks/project/${projectId}`);
    expect(forbiddenTasks.status).toBe(403);
    expect(forbiddenTasks.body.message).toBe('Access denied to this project');

    const deniedUpdate = await otherUser.agent
      .put(`/api/tasks/${taskId}`)
      .set('X-CSRF-Token', otherUser.csrfToken)
      .send({ title: 'Unauthorized change' });
    expect(deniedUpdate.status).toBe(403);

    const persistedTask = await owner.agent.get(`/api/tasks/project/${projectId}`);
    expect(persistedTask.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: taskId, title: `Updated task ${runId}`, status: 'Todo' }),
    ]));
  },
  60_000,
);
