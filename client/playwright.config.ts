import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const webServers: Extract<NonNullable<PlaywrightTestConfig['webServer']>, unknown[]> = [
  {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/login',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:5100',
      NEXT_DIST_DIR: '.next-e2e',
    },
  },
];

if (testDatabaseUrl) {
  webServers.push({
    command: 'npm --prefix ../server start',
    url: 'http://127.0.0.1:5100/api/csrf-token',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: '5100',
      NODE_ENV: 'test',
      DATABASE_URL: testDatabaseUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: 'orbit-test-access-secret-only',
      JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
      CORS_ORIGINS: 'http://127.0.0.1:3100',
      CLIENT_URL: 'http://127.0.0.1:3100',
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
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
  },
  webServer: webServers,
});
