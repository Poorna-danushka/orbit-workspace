const { ensureGoogleIdUniqueIndex } = require('../../src/services/google-id-index.service');
const logger = require('../../src/utils/logger.util');

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

  await expect(ensureGoogleIdUniqueIndex(database)).resolves.toBe(true);

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

  await expect(ensureGoogleIdUniqueIndex(database)).resolves.toBe(true);

  expect(database.$runCommandRaw).toHaveBeenCalledTimes(1);
});

test('creates the partial Google ID index when no unique index exists', async () => {
  const database = {
    $runCommandRaw: jest.fn()
      .mockResolvedValueOnce({ cursor: { firstBatch: [] } })
      .mockResolvedValueOnce({ ok: 1 }),
  };

  await expect(ensureGoogleIdUniqueIndex(database)).resolves.toBe(true);

  expect(database.$runCommandRaw).toHaveBeenCalledTimes(2);
});

test('logs duplicate Google IDs and lets startup continue without the index', async () => {
  const duplicateError = Object.assign(new Error('duplicate key'), { code: 11000 });
  const database = {
    $runCommandRaw: jest.fn()
      .mockResolvedValueOnce({ cursor: { firstBatch: [] } })
      .mockRejectedValueOnce(duplicateError),
  };
  const logError = jest.spyOn(logger, 'error').mockImplementation(() => {});

  try {
    await expect(ensureGoogleIdUniqueIndex(database)).resolves.toBe(false);
    expect(logError).toHaveBeenCalledWith(
      'Google ID index was not created because duplicate IDs exist',
      duplicateError,
    );
  } finally {
    logError.mockRestore();
  }
});

test('concurrent startup index creation is idempotent', async () => {
  let partialIndexExists = false;
  const database = {
    $runCommandRaw: jest.fn(async (command) => {
      if (command.listIndexes) {
        return {
          cursor: {
            firstBatch: partialIndexExists
              ? [createIndex({ googleId: { $gt: '' } })]
              : [],
          },
        };
      }
      if (command.createIndexes) {
        partialIndexExists = true;
        return { ok: 1 };
      }
      throw new Error('Unexpected MongoDB command');
    }),
  };

  await expect(Promise.all([
    ensureGoogleIdUniqueIndex(database),
    ensureGoogleIdUniqueIndex(database),
  ])).resolves.toEqual([true, true]);
});
