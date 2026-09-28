/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/test-env.js'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/middlewares/error.middleware.js',
    'src/middlewares/security.middleware.js',
    'src/utils/file-validation.util.js',
    'src/utils/fixed-window-limiter.util.js',
    'src/utils/google-oauth-security.util.js',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
};
