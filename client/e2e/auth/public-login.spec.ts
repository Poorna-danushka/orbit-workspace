import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';

test('public sign-in page presents the real Orbit login form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Work Email')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
});

test('a registered user signs in, creates a project and task, and starts the task', async ({ page, request }) => {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  test.skip(!testDatabaseUrl, 'NOT RUN: authenticated E2E requires the dedicated orbit_test MongoDB database');
  if (!testDatabaseUrl) return;

  const apiUrl = 'http://127.0.0.1:5100/api';
  const runId = randomUUID();
  const email = `orbit-e2e-${runId}@example.test`;
  const password = 'Orbit-e2e-password-123';
  const projectTitle = `E2E Project ${runId}`;
  const taskTitle = `E2E Task ${runId}`;

  try {
    const registration = await request.post(`${apiUrl}/auth/register`, {
      data: { username: 'Orbit E2E User', email, password },
    });
    expect(registration.status()).toBe(201);

    await page.goto('/login');
    await page.getByLabel('Work Email').fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In to Workspace' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: /Welcome back, Orbit E2E User\./ })).toBeVisible();

    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByLabel('Project Name *').fill(projectTitle);
    await page.getByRole('button', { name: 'Create Project' }).click();

    const projectLink = page.getByRole('link', { name: new RegExp(projectTitle) });
    await expect(projectLink).toBeVisible();
    await projectLink.click();
    await expect(page.getByRole('heading', { name: projectTitle })).toBeVisible();

    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByLabel('Task Title *').fill(taskTitle);
    await page.getByRole('button', { name: 'Create Task' }).click();

    const todoColumn = page.getByRole('region', { name: 'Todo tasks' });
    await expect(todoColumn.getByText(taskTitle)).toBeVisible();
    await todoColumn.getByRole('button', { name: 'Start Task' }).click();

    const inProgressColumn = page.getByRole('region', { name: 'In Progress tasks' });
    await expect(inProgressColumn.getByText(taskTitle)).toBeVisible();
    await expect(inProgressColumn.getByRole('button', { name: 'Submit for Review' })).toBeVisible();
  } finally {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: 'orbit-test-access-secret-only',
      JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
      CORS_ORIGINS: 'http://127.0.0.1:3100',
      CLIENT_URL: 'http://127.0.0.1:3100',
    });
    const serverRequire = createRequire(path.resolve(process.cwd(), '..', 'server', 'package.json'));
    const prisma = serverRequire('./src/config/prisma');
    const cleanupTestUsers = serverRequire('./tests/helpers/cleanup-test-users');

    try {
      await prisma.$connect();
      await cleanupTestUsers(prisma, [email]);
    } finally {
      await prisma.$disconnect();
    }
  }
});
