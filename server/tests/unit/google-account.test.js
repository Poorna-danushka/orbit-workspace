const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const {
  resolveGoogleAccount,
  GoogleAccountConflictError,
} = require('../../src/services/google-account.service');

const createDatabase = (initialUsers = []) => {
  const users = [...initialUsers];
  let nextId = 1;

  const findUnique = async ({ where }) => users.find((user) => (
    where.googleId ? user.googleId === where.googleId : user.email === where.email
  )) || null;

  return {
    users,
    user: {
      findUnique,
      async update({ where, data }) {
        const user = users.find((candidate) => candidate.id === where.id);
        if (!user) throw new Error('User not found');
        Object.assign(user, data);
        return user;
      },
      async create({ data }) {
        if (users.some((user) => user.email === data.email || user.googleId === data.googleId)) {
          const error = new Error('Unique constraint failed');
          error.code = 'P2002';
          throw error;
        }
        const user = { id: `new-${nextId++}`, role: 'user', ...data };
        users.push(user);
        return user;
      },
    },
  };
};

const identity = {
  sub: 'stable-google-subject',
  email: 'orbit@example.test',
  emailVerified: true,
  name: 'Orbit Person',
  picture: 'https://example.test/avatar.png',
};

test('verified Google email links an existing account without changing its role or password', async () => {
  const existing = {
    id: 'existing-user',
    email: identity.email,
    username: 'Existing User',
    password: 'existing-password-hash',
    role: 'admin',
    googleId: null,
  };
  const database = createDatabase([existing]);

  const result = await resolveGoogleAccount(identity, database);

  assert.equal(result.created, false);
  assert.equal(result.user.id, existing.id);
  assert.equal(result.user.googleId, identity.sub);
  assert.equal(result.user.role, 'admin');
  assert.equal(result.user.password, 'existing-password-hash');
  assert.equal(database.users.length, 1);
});

test('new Google identity creates one default-role Orbit user with a hashed random password', async () => {
  const database = createDatabase();

  const result = await resolveGoogleAccount(identity, database);

  assert.equal(result.created, true);
  assert.equal(result.user.role, 'user');
  assert.equal(result.user.googleId, identity.sub);
  assert.equal(result.user.username, identity.name);
  assert.equal(result.user.avatar, identity.picture);
  assert.equal(await bcrypt.compare('not-the-generated-password', result.user.password), false);
  assert.equal(database.users.length, 1);
});

test('an email already linked to a different Google subject is rejected', async () => {
  const database = createDatabase([{
    id: 'linked-user',
    email: identity.email,
    username: 'Existing User',
    password: 'existing-password-hash',
    role: 'user',
    googleId: 'different-google-subject',
  }]);

  await assert.rejects(
    resolveGoogleAccount(identity, database),
    GoogleAccountConflictError,
  );
});
