import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import {
  API_URL,
  cleanupUsers,
  countRequests,
  createProjectForUser,
  registerUser,
  requireTestDatabase,
  signIn,
} from './helpers/real-stack';

test.describe('cross-site cookie authentication', () => {
  test.skip(
    !process.env.TEST_DATABASE_URL,
    'SKIPPED: cross-site authentication requires the dedicated local test database.',
  );

  test('login, reload, refresh, CSRF, session end, logout, and socket connection', async ({
    page,
  }) => {
    requireTestDatabase();
    const email = `orbit-cross-site-${randomUUID()}@example.test`;
    const username = 'Orbit Cross-Site User';
    const apiPath = new URL(API_URL).pathname;

    try {
      const user = await registerUser(page.context(), username, email);
      await page.context().clearCookies();
      const devtools = await page.context().newCDPSession(page);
      await devtools.send('Network.enable');
      const blockedCookieReasons: string[] = [];
      let receivedAuthCookieHeaders = false;
      devtools.on('Network.responseReceivedExtraInfo', (event) => {
        const setCookieHeaders = Object.entries(event.headers)
          .filter(([name]) => name.toLowerCase() === 'set-cookie')
          .map(([, value]) => value);
        receivedAuthCookieHeaders ||= setCookieHeaders.some(
          (header) => header.includes('accessToken=') && header.includes('refreshToken='),
        );
        for (const cookie of event.blockedCookies ?? []) {
          if (/^(accessToken|refreshToken)=/.test(cookie.cookieLine)) {
            blockedCookieReasons.push(...cookie.blockedReasons);
          }
        }
      });
      const loginResponsePromise = page.waitForResponse(
        (response) => new URL(response.url()).pathname === `${apiPath}/auth/login`,
      );
      await signIn(page, email);
      const loginResponse = await loginResponsePromise;
      expect(loginResponse.status()).toBe(200);

      const authCookies = await page.context().cookies(API_URL);
      if (!authCookies.some(({ name }) => name === 'accessToken')) {
        throw new Error(
          `Cross-site auth cookie storage failed over HTTP; auth Set-Cookie headers received: ${receivedAuthCookieHeaders}; Chromium blocked-cookie reasons: ${blockedCookieReasons.join(', ') || 'not exposed by Chromium'}.`,
        );
      }
      expect(authCookies.find(({ name }) => name === 'accessToken')).toMatchObject({
        secure: true,
        sameSite: 'None',
      });
      expect(authCookies.find(({ name }) => name === 'refreshToken')).toMatchObject({
        secure: true,
        sameSite: 'None',
      });
      expect(await page.evaluate(() => document.cookie)).not.toContain('csrfToken');

      const userRequests = countRequests(page, 'GET', `${apiPath}/user/me`);
      await page.reload();
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
      expect(userRequests.count()).toBe(1);
      userRequests.stop();

      await page.waitForTimeout(12_000);
      const expiryRefreshes = countRequests(
        page,
        'POST',
        `${apiPath}/auth/refresh`,
      );
      await page.getByRole('link', { name: 'Projects', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
      expect(expiryRefreshes.count()).toBe(1);
      expiryRefreshes.stop();

      await page.context().clearCookies({ name: 'accessToken' });
      const accessCookieRefreshes = countRequests(
        page,
        'POST',
        `${apiPath}/auth/refresh`,
      );
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
      expect(accessCookieRefreshes.count()).toBe(1);
      accessCookieRefreshes.stop();

      await page.context().clearCookies({ name: 'csrfToken' });
      expect(await page.evaluate(() => document.cookie)).not.toContain('csrfToken');
      const projectTitle = `Cross-site CSRF ${randomUUID()}`;
      await page.goto('/projects');
      await page.getByRole('button', { name: 'New Project' }).click();
      await page.getByLabel('Project Name *').fill(projectTitle);
      await page.getByRole('button', { name: 'Create Project' }).click();
      await expect(page.getByText(projectTitle)).toBeVisible();

      const projectId = await createProjectForUser(user.id, `Cross-site socket ${randomUUID()}`);
      await page.goto(`/projects/${projectId}`);
      await page.getByRole('button', { name: 'Open project chat' }).click();
      await expect(
        page.getByRole('dialog', { name: 'Project team chat' }).getByText('Connected securely'),
      ).toBeVisible();

      await page.context().clearCookies({ name: 'accessToken' });
      await page.context().clearCookies({ name: 'refreshToken' });
      const loginRedirects = countRequests(page, 'GET', '/login');
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
      expect(loginRedirects.count()).toBe(1);
      loginRedirects.stop();

      await signIn(page, email);
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await expect(page).toHaveURL(/\/login\?/);
      const remainingCookies = (await page.context().cookies(API_URL)).map(({ name }) => name);
      expect(remainingCookies).not.toContain('accessToken');
      expect(remainingCookies).not.toContain('refreshToken');
    } finally {
      await cleanupUsers([email]);
    }
  });
});
