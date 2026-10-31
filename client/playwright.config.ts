import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const crossSite = process.env.PLAYWRIGHT_CROSS_SITE === 'true';
const frontendOrigin = crossSite ? 'http://localhost:3100' : 'http://127.0.0.1:3100';
const apiOrigin = crossSite ? 'http://127.0.0.1:5101' : 'http://127.0.0.1:5100';
const webServers: Extract<NonNullable<PlaywrightTestConfig['webServer']>, unknown[]> = [
  {
    command: `npm run dev -- --hostname ${crossSite ? 'localhost' : '127.0.0.1'} --port 3100`,
    url: `${frontendOrigin}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SERVER_URL: apiOrigin,
      NEXT_DIST_DIR: '.next-e2e',
    },
  },
];

if (testDatabaseUrl) {
  webServers.push({
    command: 'npm --prefix ../server start',
    url: `${apiOrigin}/api/csrf-token`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: crossSite ? '5101' : '5100',
      NODE_ENV: 'test',
      DATABASE_URL: testDatabaseUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: 'orbit-test-access-secret-only',
      JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
      ACCESS_TOKEN_TTL: '10s',
      CORS_ORIGINS: frontendOrigin,
      CLIENT_URL: frontendOrigin,
      COOKIE_SECURE: crossSite ? 'true' : 'false',
      COOKIE_SAME_SITE: crossSite ? 'none' : 'lax',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      GOOGLE_CALLBACK_URL: '',
    },
  });
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: frontendOrigin,
    trace: 'retain-on-failure',
  },
  projects: crossSite
    ? [{ name: 'cross-site', testMatch: '**/cross-site.spec.ts' }]
    : [{ name: 'chromium', testIgnore: '**/cross-site.spec.ts' }],
  webServer: webServers,
});
