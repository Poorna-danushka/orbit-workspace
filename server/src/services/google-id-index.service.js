const prisma = require('../config/prisma');

const GOOGLE_ID_INDEX_NAME = 'User_googleId_key';

const listUserIndexes = async (database) => {
  const result = await database.$runCommandRaw({ listIndexes: 'User' });
  const indexes = result?.cursor?.firstBatch;
  if (!Array.isArray(indexes)) {
    throw new Error('MongoDB did not return the User collection indexes');
  }
  return indexes;
};

const isGoogleIdUniqueIndex = (index) => (
  index.unique === true &&
  index.key?.googleId === 1 &&
  index.partialFilterExpression?.googleId?.$gt === ''
);

const ensureGoogleIdUniqueIndex = async (database = prisma) => {
  const indexes = await listUserIndexes(database);
  const existingIndex = indexes.find((index) => (
    index.unique === true && index.key?.googleId === 1
  ));

  if (existingIndex && isGoogleIdUniqueIndex(existingIndex)) return;

  if (existingIndex) {
    await database.$runCommandRaw({
      dropIndexes: 'User',
      index: existingIndex.name,
    });
  }

  await database.$runCommandRaw({
    createIndexes: 'User',
    indexes: [{
      key: { googleId: 1 },
      name: GOOGLE_ID_INDEX_NAME,
      unique: true,
      partialFilterExpression: { googleId: { $gt: '' } },
    }],
  });
};

module.exports = { ensureGoogleIdUniqueIndex };
