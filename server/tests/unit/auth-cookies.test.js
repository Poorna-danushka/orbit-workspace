const {
  clearAllAuthCookies,
  setAccessCookie,
  setAuthCookies,
} = require('../../src/utils/auth-cookies.util');

const response = () => ({
  cookies: [],
  clearedCookies: [],
  cookie(name, value, options) {
    this.cookies.push({ name, value, options });
    return this;
  },
  clearCookie(name, options) {
    this.clearedCookies.push({ name, options });
    return this;
  },
});

test('auth cookie lifetime uses the refresh TTL for both JWT cookies', () => {
  const res = response();
  setAuthCookies(res, 'access-token', 'refresh-token');

  expect(res.cookies.map(({ name, options }) => [name, options.maxAge])).toEqual([
    ['accessToken', 7 * 24 * 60 * 60 * 1000],
    ['refreshToken', 7 * 24 * 60 * 60 * 1000],
  ]);
  expect(res.cookies.every(({ options }) => options.httpOnly)).toBe(true);
});

test('clear cookie options match the token cookie scope and security flags', () => {
  const res = response();
  setAccessCookie(res, 'access-token');
  setAuthCookies(res, 'access-token', 'refresh-token');
  clearAllAuthCookies(res);

  for (const name of ['accessToken', 'refreshToken']) {
    const setOptions = res.cookies.find((cookie) => cookie.name === name).options;
    const clearOptions = res.clearedCookies.find((cookie) => cookie.name === name).options;
    for (const key of ['path', 'domain', 'sameSite', 'secure']) {
      expect(clearOptions[key]).toEqual(setOptions[key]);
    }
  }
});
