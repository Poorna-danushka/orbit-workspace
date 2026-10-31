const request = require('supertest');
const app = require('../../src/app');

const publicAuthCases = [
  ['/api/auth/login', {}],
  ['/api/auth/register', {}],
  ['/api/auth/forgot-password', {}],
  ['/api/auth/reset-password', {}],
  ['/api/auth/refresh', undefined],
];

test('mutations reject a missing CSRF token', async () => {
  const response = await request(app).post('/api/projects').send({ title: 'No token' });

  expect(response.status).toBe(403);
  expect(response.body.code).toBe('CSRF_INVALID');
});

test('mutations reject a wrong CSRF token', async () => {
  const response = await request(app)
    .post('/api/projects')
    .set('Cookie', 'csrfToken=wrong-cookie-token')
    .set('X-CSRF-Token', 'wrong-header-token')
    .send({ title: 'Wrong token' });

  expect(response.status).toBe(403);
  expect(response.body.code).toBe('CSRF_INVALID');
});

test('a valid signed header-only CSRF token passes cross-site fallback validation', async () => {
  const csrf = await request(app).get('/api/csrf-token');
  const response = await request(app)
    .post('/api/projects')
    .set('X-CSRF-Token', csrf.body.csrfToken)
    .send({ title: 'Header only' });

  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
});

test('a matching CSRF cookie and header pass double-submit validation', async () => {
  const csrf = await request(app).get('/api/csrf-token');
  const response = await request(app)
    .post('/api/projects')
    .set('Cookie', `csrfToken=${csrf.body.csrfToken}`)
    .set('X-CSRF-Token', csrf.body.csrfToken)
    .send({ title: 'Cookie and header' });

  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
});

test.each(publicAuthCases)('%s is CSRF-exempt', async (path, body) => {
  const response = body === undefined
    ? await request(app).post(path)
    : await request(app).post(path).send(body);

  expect(response.status).not.toBe(403);
  expect(response.body.code).not.toBe('CSRF_INVALID');
});

test('CORS accepts the configured origin, credentials, and X-CSRF-Token preflight header', async () => {
  const response = await request(app)
    .options('/api/projects')
    .set('Origin', 'http://localhost:3000')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type,x-csrf-token');

  expect(response.status).toBe(204);
  expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  expect(response.headers['access-control-allow-credentials']).toBe('true');
  expect(response.headers['access-control-allow-headers'].toLowerCase()).toContain('x-csrf-token');
});

test('CORS rejects an origin outside the configured allowlist', async () => {
  const response = await request(app)
    .options('/api/projects')
    .set('Origin', 'https://untrusted.example')
    .set('Access-Control-Request-Method', 'POST');

  expect(response.status).toBe(403);
  expect(response.body.code).toBe('FORBIDDEN');
});
