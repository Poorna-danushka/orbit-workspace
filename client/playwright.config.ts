import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const crossSite = process.env.PLAYWRIGHT_CROSS_SITE === 'true';
const sameSite = process.env.PLAYWRIGHT_SAME_SITE === 'true';
if (crossSite && sameSite) {
  throw new Error('Enable only one of PLAYWRIGHT_CROSS_SITE or PLAYWRIGHT_SAME_SITE.');
}
const cookieTestMode = crossSite || sameSite;
const frontendOrigin = crossSite
  ? 'https://localhost:3100'
  : sameSite
    ? 'https://app.localtest.me:3100'
    : 'http://127.0.0.1:3100';
const apiOrigin = crossSite
  ? 'https://127.0.0.1:5101'
  : sameSite
    ? 'https://api.localtest.me:5101'
    : 'http://127.0.0.1:5100';
const cookieDomain = sameSite ? '.localtest.me' : undefined;
const webServers: Extract<NonNullable<PlaywrightTestConfig['webServer']>, unknown[]> = [
  {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${cookieTestMode ? '3000' : '3100'}`,
    url: `http://127.0.0.1:${cookieTestMode ? '3000' : '3100'}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SERVER_URL: apiOrigin,
      NEXT_DIST_DIR: '.next-e2e',
      PLAYWRIGHT_SAME_SITE: sameSite ? 'true' : '',
    },
  },
];

if (testDatabaseUrl) {
  webServers.push({
    command: 'npm --prefix ../server start',
    url: `http://127.0.0.1:5100/api/csrf-token`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: '5100',
      NODE_ENV: 'test',
      DATABASE_URL: testDatabaseUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: 'orbit-test-access-secret-only',
      JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
      ACCESS_TOKEN_TTL: '10s',
      CORS_ORIGINS: frontendOrigin,
      CLIENT_URL: frontendOrigin,
      COOKIE_SECURE: cookieTestMode ? 'true' : 'false',
      COOKIE_SAME_SITE: crossSite ? 'none' : 'lax',
      COOKIE_DOMAIN: cookieDomain ?? '',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      GOOGLE_CALLBACK_URL: '',
    },
  });

  if (cookieTestMode) {
    webServers.push(
      {
        command: 'npm run proxy:api:tls',
        url: `${apiOrigin}/api/csrf-token`,
        reuseExistingServer: false,
        timeout: 30_000,
        ignoreHTTPSErrors: true,
      },
      {
        command: 'npm run proxy:client:tls',
        url: `${frontendOrigin}/login`,
        reuseExistingServer: false,
        timeout: 30_000,
        ignoreHTTPSErrors: true,
      },
    );
  }
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: frontendOrigin,
    ignoreHTTPSErrors: cookieTestMode,
    trace: 'retain-on-failure',
  },
  projects: crossSite
    ? [{ name: 'cross-site', testMatch: '**/cross-site.spec.ts' }]
    : sameSite
      ? [{ name: 'same-site', testMatch: '**/same-site.spec.ts' }]
      : [
          {
            name: 'chromium',
            testIgnore: ['**/cross-site.spec.ts', '**/same-site.spec.ts'],
          },
        ],
  webServer: webServers,
});
