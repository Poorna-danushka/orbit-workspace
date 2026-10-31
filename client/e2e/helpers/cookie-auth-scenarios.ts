import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import {
  API_URL,
  cleanupUsers,
  countRequests,
  createProjectForUser,
  registerUser,
  requireTestDatabase,
  signIn,
} from './real-stack';

type CookieMode = 'cross-site' | 'same-site';

function uniqueEmail(prefix: string): string {
  return `e2e-${prefix}-${randomUUID()}@example.test`;
}

async function createSignedInUser(page: Page, prefix: string) {
  const email = uniqueEmail(prefix);
  const user = await registerUser(page.context(), 'Orbit Cookie User', email);
  await page.context().clearCookies();
  await signIn(page, email);
  return { email, user };
}

export function registerCookieAuthScenarios(mode: CookieMode): void {
  const sameSite = mode === 'same-site';

  test.describe(`${mode} cookie authentication`, () => {
    test.skip(
      !process.env.TEST_DATABASE_URL,
      'SKIPPED: cookie authentication requires the dedicated local test database.',
    );

    test('login and reload preserve the session with one current-user request', async ({
      page,
    }) => {
      requireTestDatabase();
      const email = uniqueEmail('reload');
      try {
        await registerUser(page.context(), 'Orbit Cookie User', email);
        await page.context().clearCookies();
        await signIn(page, email);

        const authCookies = await page.context().cookies(API_URL);
        const attributes = {
          httpOnly: true,
          secure: true,
          sameSite: sameSite ? 'Lax' : 'None',
          ...(sameSite ? { domain: '.localtest.me' } : {}),
        };
        expect(authCookies.find(({ name }) => name === 'accessToken')).toMatchObject(attributes);
        expect(authCookies.find(({ name }) => name === 'refreshToken')).toMatchObject(attributes);
        const readableCookies = await page.evaluate(() => document.cookie);
        if (sameSite) {
          expect(readableCookies).toContain('csrfToken=');
        } else {
          expect(readableCookies).not.toContain('csrfToken');
        }

        const userRequests = countRequests(page, 'GET', `${new URL(API_URL).pathname}/user/me`);
        await page.reload();
        await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
        expect(userRequests.count()).toBe(1);
        userRequests.stop();
      } finally {
        await cleanupUsers([email]);
      }
    });

    test('silently refreshes after the 10-second access-token lifetime', async ({ page }) => {
      requireTestDatabase();
      const email = uniqueEmail('refresh');
      try {
        await registerUser(page.context(), 'Orbit Cookie User', email);
        await page.context().clearCookies();
        await signIn(page, email);
        await page.waitForTimeout(11_000);

        const refreshes = countRequests(page, 'POST', `${new URL(API_URL).pathname}/auth/refresh`);
        await page.getByRole('link', { name: 'Projects', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
        expect(refreshes.count()).toBe(1);
        refreshes.stop();
      } finally {
        await cleanupUsers([email]);
      }
    });

    test('recovers the session when only the access cookie is deleted', async ({ page }) => {
      requireTestDatabase();
      const email = uniqueEmail('access');
      try {
        await registerUser(page.context(), 'Orbit Cookie User', email);
        await page.context().clearCookies();
        await signIn(page, email);
        await page.context().clearCookies({ name: 'accessToken' });

        const refreshes = countRequests(page, 'POST', `${new URL(API_URL).pathname}/auth/refresh`);
        await page.goto('/dashboard');
        await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
        expect(refreshes.count()).toBe(1);
        refreshes.stop();
      } finally {
        await cleanupUsers([email]);
      }
    });

    test('redirects once when both auth cookies are deleted', async ({ page }) => {
      requireTestDatabase();
      const email = uniqueEmail('no-cookie');
      try {
        await registerUser(page.context(), 'Orbit Cookie User', email);
        await page.context().clearCookies();
        await signIn(page, email);
        await page.context().clearCookies({ name: 'accessToken' });
        await page.context().clearCookies({ name: 'refreshToken' });

        const loginRedirects = countRequests(page, 'GET', '/login');
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
        expect(loginRedirects.count()).toBe(1);
        loginRedirects.stop();
      } finally {
        await cleanupUsers([email]);
      }
    });

    test('completes a CSRF-protected mutation after clearing the CSRF cookie', async ({ page }) => {
      requireTestDatabase();
      const email = uniqueEmail('csrf');
      try {
        await registerUser(page.context(), 'Orbit Cookie User', email);
        await page.context().clearCookies();
        await signIn(page, email);

        const readableCookies = await page.evaluate(() => document.cookie);
        if (sameSite) {
          expect(readableCookies).toContain('csrfToken=');
        } else {
          expect(readableCookies).not.toContain('csrfToken');
        }
        await page.context().clearCookies({ name: 'csrfToken' });
        const projectTitle = `Cookie CSRF ${randomUUID()}`;
        await page.goto('/projects');
        await page.getByRole('button', { name: 'New Project' }).click();
        await page.getByLabel('Project Name *').fill(projectTitle);
        await page.getByRole('button', { name: 'Create Project' }).click();
        await expect(page.getByText(projectTitle)).toBeVisible();
      } finally {
        await cleanupUsers([email]);
      }
    });

    test('logout clears both auth cookies for the API and frontend hosts', async ({ page }) => {
      requireTestDatabase();
      const email = uniqueEmail('logout');
      try {
        await registerUser(page.context(), 'Orbit Cookie User', email);
        await page.context().clearCookies();
        await signIn(page, email);
        await page.getByRole('button', { name: 'Sign Out' }).click();
        await expect(page).toHaveURL(/\/login\?/);

        const frontendOrigin = new URL(page.url()).origin;
        const hostCookies = await page.context().cookies([API_URL, frontendOrigin]);
        expect(hostCookies.map(({ name }) => name)).not.toContain('accessToken');
        expect(hostCookies.map(({ name }) => name)).not.toContain('refreshToken');
      } finally {
        await cleanupUsers([email]);
      }
    });

    test('connects the project socket using the auth cookies', async ({ page }) => {
      requireTestDatabase();
      let email = '';
      try {
        const signedInUser = await createSignedInUser(page, 'socket');
        email = signedInUser.email;
        const projectId = await createProjectForUser(
          signedInUser.user.id,
          `Cookie socket ${randomUUID()}`,
        );
        await page.goto(`/projects/${projectId}`);
        await page.getByRole('button', { name: 'Open project chat' }).click();
        await expect(
          page.getByRole('dialog', { name: 'Project team chat' }).getByText('Connected securely'),
        ).toBeVisible();
      } finally {
        await cleanupUsers([email]);
      }
    });
  });
}
