import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { expect, type BrowserContext, type Page, type Request } from '@playwright/test';

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
export const API_URL =
  process.env.PLAYWRIGHT_CROSS_SITE === 'true'
    ? 'http://127.0.0.1:5101/api'
    : 'http://127.0.0.1:5100/api';
export const E2E_PASSWORD = 'Orbit-e2e-password-123';

const serverPackagePath = path.resolve(process.cwd(), '..', 'server', 'package.json');
const serverRoot = path.dirname(serverPackagePath);
const serverRequire = createRequire(serverPackagePath);

export interface E2eUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface TestDatabase {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $runCommandRaw(command: Record<string, unknown>): Promise<unknown>;
  refreshToken: {
    findUnique(args: {
      where: { tokenHash: string };
      select: { revokedAt: true; expiresAt: true; replacedBy: true };
    }): Promise<{ revokedAt: Date | null; expiresAt: Date; replacedBy: string | null } | null>;
    findMany(args: {
      where: { tokenHash: string; revokedAt: { isSet: false } };
      select: { tokenHash: true };
    }): Promise<{ tokenHash: string }[]>;
  };
  project: {
    create(args: {
      data: { title: string; description: string; ownerId: string };
      select: { id: true };
    }): Promise<{ id: string }>;
  };
  projectInvitation: {
    create(args: {
      data: {
        projectId: string;
        inviterId: string;
        invitedUserId: string;
        invitedEmail: string;
        token: string;
        status: 'pending';
        expiresAt: Date;
      };
    }): Promise<unknown>;
    findUnique(args: {
      where: { token: string };
      select: { status: true };
    }): Promise<{ status: string } | null>;
  };
  projectMember: {
    create(args: {
      data: { projectId: string; userId: string; role: 'member' };
    }): Promise<unknown>;
  };
}

function isE2eUser(value: unknown): value is E2eUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string'
  );
}

export function requireTestDatabase(): string {
  if (!TEST_DATABASE_URL) {
    throw new Error('Authenticated real-stack tests require TEST_DATABASE_URL.');
  }
  return TEST_DATABASE_URL;
}

export async function registerUser(
  context: BrowserContext,
  username: string,
  email: string,
): Promise<E2eUser> {
  const response = await context.request.post(`${API_URL}/auth/register`, {
    data: { username, email, password: E2E_PASSWORD },
  });
  expect(response.status()).toBe(201);
  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== 'object' ||
    !('user' in body) ||
    !isE2eUser(body.user)
  ) {
    throw new Error('Registration response did not contain a valid user.');
  }
  return body.user;
}

export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Work Email').fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign In to Workspace' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function withTestDatabase<T>(
  callback: (database: TestDatabase) => Promise<T>,
): Promise<T> {
  const databaseUrl = requireTestDatabase();
  Object.assign(process.env, {
    NODE_ENV: 'test',
    DATABASE_URL: databaseUrl,
    TEST_DATABASE_URL: databaseUrl,
    JWT_SECRET: 'orbit-test-access-secret-only',
    JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
    CORS_ORIGINS: 'http://127.0.0.1:3100',
    CLIENT_URL: 'http://127.0.0.1:3100',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  });
  const prisma = serverRequire('./src/config/prisma') as TestDatabase;
  await prisma.$connect();
  try {
    return await callback(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

export async function cleanupUsers(emails: string[]): Promise<void> {
  if (!emails.length) return;
  await withTestDatabase(async (database) => {
    const cleanupTestUsers = serverRequire('./tests/helpers/cleanup-test-users') as (
      client: TestDatabase,
      users: string[],
    ) => Promise<void>;
    await cleanupTestUsers(database, emails);
  });
}

export async function inspectRefreshToken(token: string): Promise<{
  exists: boolean;
  active: boolean;
  replaced: boolean;
  jwtValid: boolean;
  jwtError: string | null;
}> {
  return withTestDatabase(async (database) => {
    const { hashToken, verifyRefreshToken } = serverRequire('./src/utils/token.util') as {
      hashToken(value: string): string;
      verifyRefreshToken(value: string): unknown;
    };
    let jwtValid = true;
    let jwtError: string | null = null;
    try {
      verifyRefreshToken(token);
    } catch (error: unknown) {
      jwtValid = false;
      jwtError = error instanceof Error ? error.name : 'UnknownError';
    }
    const record = await database.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { revokedAt: true, expiresAt: true, replacedBy: true },
    });
    return {
      exists: Boolean(record),
      active: Boolean(record && !record.revokedAt && record.expiresAt > new Date()),
      replaced: Boolean(record?.replacedBy),
      jwtValid,
      jwtError,
    };
  });
}

export async function makeRefreshTokenLegacy(token: string): Promise<void> {
  await withTestDatabase(async (database) => {
    const { hashToken } = serverRequire('./src/utils/token.util') as {
      hashToken(value: string): string;
    };
    const tokenHash = hashToken(token);
    await database.$runCommandRaw({
      update: 'RefreshToken',
      updates: [{ q: { tokenHash }, u: { $unset: { revokedAt: '' } }, multi: false }],
    });
    const records = await database.refreshToken.findMany({
      where: { tokenHash, revokedAt: { isSet: false } },
      select: { tokenHash: true },
    });
    if (records.length !== 1) {
      throw new Error('Failed to prepare a legacy refresh-token record for the integration test.');
    }
  });
}

export async function createProjectForUser(ownerId: string, title: string): Promise<string> {
  return withTestDatabase(async (database) => {
    const project = await database.project.create({
      data: { title, description: 'Created by the real-stack Playwright suite.', ownerId },
      select: { id: true },
    });
    return project.id;
  });
}

export async function addProjectMember(projectId: string, userId: string): Promise<void> {
  await withTestDatabase(async (database) => {
    await database.projectMember.create({
      data: { projectId, userId, role: 'member' },
    });
  });
}

export async function createProjectInvitation(input: {
  projectId: string;
  inviterId: string;
  invitedUserId: string;
  invitedEmail: string;
  token: string;
}): Promise<void> {
  await withTestDatabase(async (database) => {
    await database.projectInvitation.create({
      data: {
        ...input,
        status: 'pending',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  });
}

export async function getInvitationStatus(token: string): Promise<string | null> {
  return withTestDatabase(async (database) => {
    const invitation = await database.projectInvitation.findUnique({
      where: { token },
      select: { status: true },
    });
    return invitation?.status ?? null;
  });
}

export function seedAdmin(email: string, password: string): void {
  const environment = {
    ...process.env,
    DATABASE_URL: requireTestDatabase(),
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: password,
    ADMIN_USERNAME: 'Orbit Playwright Admin',
  };
  execFileSync(process.execPath, [path.join(serverRoot, 'scripts', 'create-admin.js')], {
    cwd: serverRoot,
    env: environment,
    stdio: 'pipe',
  });
}

export function countRequests(
  page: Page,
  method: string,
  pathname: string,
): { count: () => number; stop: () => void } {
  let total = 0;
  const listener = (request: Request) => {
    const url = new URL(request.url());
    if (request.method() === method && url.pathname === pathname) total += 1;
  };
  page.on('request', listener);
  return {
    count: () => total,
    stop: () => page.off('request', listener),
  };
}
