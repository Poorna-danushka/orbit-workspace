const request = require('supertest');
const app = require('../../src/app');

test('login validates credentials through the real Express route', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'not-an-email', password: '' });

  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ path: 'email' }),
    expect.objectContaining({ path: 'password' }),
  ]));
});

test('mutating project requests reject missing CSRF tokens', async () => {
  const response = await request(app)
    .post('/api/projects')
    .send({ title: 'A test project' });

  expect(response.status).toBe(403);
  expect(response.body.message).toMatch(/CSRF validation failed/);
});

test('a valid CSRF token passes CSRF middleware before authentication is checked', async () => {
  const csrfResponse = await request(app).get('/api/csrf-token');
  const response = await request(app)
    .post('/api/projects')
    .set('X-CSRF-Token', csrfResponse.body.csrfToken)
    .send({ title: 'A test project' });

  expect(csrfResponse.status).toBe(200);
  expect(csrfResponse.body.csrfToken).toMatch(/^[a-f0-9]{48}\.[a-f0-9]{64}$/);
  expect(response.status).toBe(401);
  expect(response.body.message).toBe('No authorization token provided');
});

test('protected project reads reject unauthenticated requests', async () => {
  const response = await request(app).get('/api/projects');

  expect(response.status).toBe(401);
  expect(response.body.message).toBe('No authorization token provided');
});
