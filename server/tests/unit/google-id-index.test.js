const { ensureGoogleIdUniqueIndex } = require('../../src/services/google-id-index.service');

const createIndex = (partialFilterExpression) => ({
  name: 'User_googleId_key',
  key: { googleId: 1 },
  unique: true,
  ...(partialFilterExpression ? { partialFilterExpression } : {}),
});

test('replaces a legacy non-partial Google ID index with a partial unique index', async () => {
  const database = {
    $runCommandRaw: jest.fn()
      .mockResolvedValueOnce({ cursor: { firstBatch: [createIndex()] } })
      .mockResolvedValueOnce({ ok: 1 })
      .mockResolvedValueOnce({ ok: 1 }),
  };

  await ensureGoogleIdUniqueIndex(database);

  expect(database.$runCommandRaw).toHaveBeenNthCalledWith(2, {
    dropIndexes: 'User',
    index: 'User_googleId_key',
  });
  expect(database.$runCommandRaw).toHaveBeenNthCalledWith(3, {
    createIndexes: 'User',
    indexes: [{
      key: { googleId: 1 },
      name: 'User_googleId_key',
      unique: true,
      partialFilterExpression: { googleId: { $gt: '' } },
    }],
  });
});

test('keeps an existing partial Google ID index in place', async () => {
  const database = {
    $runCommandRaw: jest.fn().mockResolvedValue({
      cursor: { firstBatch: [createIndex({ googleId: { $gt: '' } })] },
    }),
  };

  await ensureGoogleIdUniqueIndex(database);

  expect(database.$runCommandRaw).toHaveBeenCalledTimes(1);
});

test('creates the partial Google ID index when no unique index exists', async () => {
  const database = {
    $runCommandRaw: jest.fn()
      .mockResolvedValueOnce({ cursor: { firstBatch: [] } })
      .mockResolvedValueOnce({ ok: 1 }),
  };

  await ensureGoogleIdUniqueIndex(database);

  expect(database.$runCommandRaw).toHaveBeenCalledTimes(2);
});
