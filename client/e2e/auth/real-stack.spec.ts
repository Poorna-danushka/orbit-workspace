import { randomBytes, randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import {
  addProjectMember,
  API_URL,
  cleanupUsers,
  countRequests,
  createProjectForUser,
  createProjectInvitation,
  getInvitationStatus,
  inspectRefreshToken,
  makeRefreshTokenLegacy,
  registerUser,
  requireTestDatabase,
  seedAdmin,
  signIn,
  TEST_DATABASE_URL,
} from '../helpers/real-stack';

function uniqueEmail(prefix: string): string {
  return `orbit-${prefix}-${randomUUID()}@example.test`;
}

async function createProjectInUi(page: import('@playwright/test').Page, title: string) {
  await page.goto('/projects');
  await page.getByRole('button', { name: 'New Project' }).click();
  await page.getByLabel('Project Name *').fill(title);
  await page.getByRole('button', { name: 'Create Project' }).click();
  await expect(page.getByText(title)).toBeVisible();
}

async function signOut(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/login\?/);
}

test.describe('real-stack authentication and feature workflows', () => {
  test.skip(
    !TEST_DATABASE_URL,
    'SKIPPED: set TEST_DATABASE_URL to the dedicated orbit_test MongoDB database.',
  );

  test('a-e: login, reload, refresh, cookie recovery, session end, and logout', async ({
    page,
  }) => {
    requireTestDatabase();
    const email = uniqueEmail('session');
    const username = 'Orbit Session User';
    try {
      await registerUser(page.context(), username, email);
      await page.context().clearCookies();
      await signIn(page, email);
      const authCookies = await page.context().cookies(API_URL);
      const authCookieNames = authCookies.map(({ name }) => name);
      expect(authCookieNames).toEqual(expect.arrayContaining(['accessToken', 'refreshToken']));
      expect(authCookieNames.filter((name) => name === 'refreshToken')).toHaveLength(1);
      const refreshCookie = authCookies.find(({ name }) => name === 'refreshToken');
      if (!refreshCookie) throw new Error('Login did not set a refresh cookie.');
      expect(await inspectRefreshToken(refreshCookie.value)).toEqual({
        exists: true,
        active: true,
        replaced: false,
        jwtValid: true,
        jwtError: null,
      });
      await makeRefreshTokenLegacy(refreshCookie.value);

      const currentUserRequests = countRequests(page, 'GET', `${new URL(API_URL).pathname}/user/me`);
      await page.reload();
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
      expect(currentUserRequests.count()).toBe(1);
      currentUserRequests.stop();

      await page.waitForTimeout(12_000);
      const expiredAccessResponse = await page.context().request.get(`${API_URL}/user/me`);
      expect(expiredAccessResponse.status()).toBe(401);
      const expiredAccessBody: unknown = await expiredAccessResponse.json();
      expect(
        expiredAccessBody &&
          typeof expiredAccessBody === 'object' &&
          'code' in expiredAccessBody
          ? expiredAccessBody.code
          : undefined,
      ).toBe('AUTH_TOKEN_EXPIRED');
      const refreshAfterExpiry = countRequests(
        page,
        'POST',
        `${new URL(API_URL).pathname}/auth/refresh`,
      );
      const refreshResponse = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === `${new URL(API_URL).pathname}/auth/refresh`,
      );
      await page.getByRole('link', { name: 'Projects', exact: true }).click();
      const refreshResult = await refreshResponse;
      expect(refreshAfterExpiry.count()).toBe(1);
      expect(refreshResult.status()).toBe(200);
      await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
      refreshAfterExpiry.stop();

      await page.context().clearCookies({ name: 'accessToken' });
      const refreshWithoutAccess = countRequests(
        page,
        'POST',
        `${new URL(API_URL).pathname}/auth/refresh`,
      );
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
      expect(refreshWithoutAccess.count()).toBe(1);
      refreshWithoutAccess.stop();

      await page.context().clearCookies({ name: 'accessToken' });
      await page.context().clearCookies({ name: 'refreshToken' });
      const loginRedirects = countRequests(page, 'GET', '/login');
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
      expect(loginRedirects.count()).toBe(1);
      loginRedirects.stop();

      await signIn(page, email);
      await signOut(page);
      const cookieNames = (await page.context().cookies()).map(({ name }) => name);
      expect(cookieNames).not.toContain('accessToken');
      expect(cookieNames).not.toContain('refreshToken');

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
      await page.goBack();
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toHaveCount(0);
    } finally {
      await cleanupUsers([email]);
    }
  });

  test('f: concurrent refreshes in two tabs keep both sessions authenticated', async ({
    page,
  }) => {
    requireTestDatabase();
    const email = uniqueEmail('tabs');
    const username = 'Orbit Multi Tab User';
    const secondPage = await page.context().newPage();
    try {
      await registerUser(page.context(), username, email);
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
      await secondPage.goto('/projects');
      await expect(secondPage.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
      await page.waitForTimeout(12_000);

      const refreshes = countRequests(page, 'POST', `${new URL(API_URL).pathname}/auth/refresh`);
      const secondRefreshes = countRequests(
        secondPage,
        'POST',
        `${new URL(API_URL).pathname}/auth/refresh`,
      );
      await Promise.all([page.reload(), secondPage.reload()]);
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
      await expect(secondPage.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
      expect(refreshes.count() + secondRefreshes.count()).toBe(1);
      refreshes.stop();
      secondRefreshes.stop();
    } finally {
      await secondPage.close();
      await cleanupUsers([email]);
    }
  });

  test('g: a project mutation succeeds after the readable CSRF cookie is removed', async ({
    page,
  }) => {
    requireTestDatabase();
    const email = uniqueEmail('csrf');
    try {
      await registerUser(page.context(), 'Orbit CSRF User', email);
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

      const firstProject = `CSRF warmup ${randomUUID()}`;
      await createProjectInUi(page, firstProject);
      await page.context().clearCookies({ name: 'csrfToken' });
      const secondProject = `CSRF mutation ${randomUUID()}`;
      await createProjectInUi(page, secondProject);
      await expect(page.getByText(secondProject)).toBeVisible();
    } finally {
      await cleanupUsers([email]);
    }
  });

  test('h: non-admin access is redirected and an admin account seeded by the existing script is allowed', async ({
    browser,
    page,
  }) => {
    requireTestDatabase();
    const userEmail = uniqueEmail('member');
    const adminEmail = uniqueEmail('admin');
    const adminPassword = `Orbit-admin-${randomUUID()}-123`;
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    try {
      await registerUser(page.context(), 'Orbit Non Admin', userEmail);
      await page.goto('/admin-dashboard');
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText('Admin Mode')).toHaveCount(0);

      seedAdmin(adminEmail, adminPassword);
      await adminPage.goto('/login');
      await adminPage.getByLabel('Work Email').fill(adminEmail);
      await adminPage.getByRole('textbox', { name: 'Password' }).fill(adminPassword);
      await adminPage.getByRole('button', { name: 'Sign In to Workspace' }).click();
      await expect(adminPage).toHaveURL(/\/admin-dashboard$/);
      await adminPage.goto('/admin-dashboard');
      await expect(adminPage.getByText('Admin Mode')).toBeVisible();
    } finally {
      await adminContext.close();
      await cleanupUsers([userEmail, adminEmail]);
    }
  });

  test('i: project chat delivers a message across browsers and reconnects after token expiry', async ({
    browser,
    page,
  }) => {
    requireTestDatabase();
    const ownerEmail = uniqueEmail('chat-owner');
    const memberEmail = uniqueEmail('chat-member');
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    try {
      const owner = await registerUser(page.context(), 'Orbit Chat Owner', ownerEmail);
      const member = await registerUser(memberContext, 'Orbit Chat Member', memberEmail);
      const projectId = await createProjectForUser(owner.id, `Chat ${randomUUID()}`);
      await addProjectMember(projectId, member.id);

      await page.goto(`/projects/${projectId}`);
      await page.getByRole('button', { name: 'Open project chat' }).click();
      const ownerChat = page.getByRole('dialog', { name: 'Project team chat' });
      await expect(ownerChat.getByText('Connected securely')).toBeVisible();

      await memberPage.goto(`/projects/${projectId}`);
      await memberPage.getByRole('button', { name: 'Open project chat' }).click();
      const memberChat = memberPage.getByRole('dialog', { name: 'Project team chat' });
      await expect(memberChat.getByText('Connected securely')).toBeVisible();

      const initialMessage = `Realtime message ${randomUUID()}`;
      await ownerChat.getByPlaceholder('Write a message…').fill(initialMessage);
      await ownerChat.getByRole('button', { name: 'Send message' }).click();
      await expect(memberChat.getByText(initialMessage)).toBeVisible();

      await page.waitForTimeout(12_000);
      const ownerRefreshes = countRequests(
        page,
        'POST',
        `${new URL(API_URL).pathname}/auth/refresh`,
      );
      const memberRefreshes = countRequests(
        memberPage,
        'POST',
        `${new URL(API_URL).pathname}/auth/refresh`,
      );
      await Promise.all([page.reload(), memberPage.reload()]);
      await Promise.all([
        page.getByRole('button', { name: 'Open project chat' }).click(),
        memberPage.getByRole('button', { name: 'Open project chat' }).click(),
      ]);
      const reconnectedOwnerChat = page.getByRole('dialog', { name: 'Project team chat' });
      const reconnectedMemberChat = memberPage.getByRole('dialog', { name: 'Project team chat' });
      await expect(reconnectedOwnerChat.getByText('Connected securely')).toBeVisible();
      await expect(reconnectedMemberChat.getByText('Connected securely')).toBeVisible();
      expect(ownerRefreshes.count()).toBe(1);
      expect(memberRefreshes.count()).toBe(1);
      ownerRefreshes.stop();
      memberRefreshes.stop();

      const reconnectedMessage = `Realtime reconnect ${randomUUID()}`;
      await reconnectedOwnerChat.getByPlaceholder('Write a message…').fill(reconnectedMessage);
      await reconnectedOwnerChat.getByRole('button', { name: 'Send message' }).click();
      await expect(reconnectedMemberChat.getByText(reconnectedMessage)).toBeVisible();
    } finally {
      if (!memberPage.isClosed()) await memberContext.close();
      await cleanupUsers([ownerEmail, memberEmail]);
    }
  });

  test('j: invalid avatar content is rejected; real Cloudinary upload is skipped when unconfigured', async ({
    page,
  }) => {
    requireTestDatabase();
    const email = uniqueEmail('avatar');
    try {
      await registerUser(page.context(), 'Orbit Avatar User', email);
      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: 'Profile & security' })).toBeVisible();
      await page.locator('input[type="file"]').setInputFiles({
        name: 'invalid.png',
        mimeType: 'image/png',
        buffer: Buffer.from('not a PNG image'),
      });
      await expect(page.getByText('Avatar content does not match', { exact: false })).toBeVisible();
    } finally {
      await cleanupUsers([email]);
    }
  });

  test('j: real Cloudinary upload is skipped in external-credential-safe runs', async () => {
    test.skip(
      true,
      'SKIPPED: a real Cloudinary upload would transmit configured provider credentials externally; avatar validation is covered separately and the SDK signature has a mocked server test.',
    );
  });

  test('k: a logged-out user can open an invitation and the invited user can accept it', async ({
    browser,
    page,
  }) => {
    requireTestDatabase();
    const ownerEmail = uniqueEmail('invite-owner');
    const invitedEmail = uniqueEmail('invitee');
    const invitedContext = await browser.newContext();
    const invitedPage = await invitedContext.newPage();
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    const token = randomBytes(32).toString('hex');
    try {
      const owner = await registerUser(page.context(), 'Orbit Invitation Owner', ownerEmail);
      const invited = await registerUser(invitedContext, 'Orbit Invitee', invitedEmail);
      const projectTitle = `Invitation ${randomUUID()}`;
      const projectId = await createProjectForUser(owner.id, projectTitle);
      await createProjectInvitation({
        projectId,
        inviterId: owner.id,
        invitedUserId: invited.id,
        invitedEmail,
        token,
      });
      const invitationUrl = `/project-invitations/${token}`;

      await guestPage.goto(invitationUrl);
      await expect(
        guestPage.getByRole('heading', { name: /You've been invited to join/ }),
      ).toContainText(projectTitle);
      await guestPage.getByRole('link', { name: 'Sign in' }).click();
      await expect(guestPage).toHaveURL(/\/login\?next=/);

      await signIn(invitedPage, invitedEmail);
      await invitedPage.goto(invitationUrl);
      await expect(invitedPage.getByRole('button', { name: 'Accept Invitation' })).toBeVisible();
      await invitedPage.getByRole('button', { name: 'Accept Invitation' }).click();
      await expect(invitedPage).toHaveURL(/\/projects$/);
      expect(await getInvitationStatus(token)).toBe('accepted');
    } finally {
      await Promise.all([invitedContext.close(), guestContext.close()]);
      await cleanupUsers([ownerEmail, invitedEmail]);
    }
  });
});
