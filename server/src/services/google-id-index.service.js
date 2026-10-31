const prisma = require('../config/prisma');
const logger = require('../utils/logger.util');

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

  if (existingIndex && isGoogleIdUniqueIndex(existingIndex)) return true;

  if (existingIndex) {
    try {
      await database.$runCommandRaw({
        dropIndexes: 'User',
        index: existingIndex.name,
      });
    } catch (error) {
      if (error?.code !== 27) throw error;
      const currentIndexes = await listUserIndexes(database);
      if (currentIndexes.some(isGoogleIdUniqueIndex)) return true;
    }
  }

  try {
    await database.$runCommandRaw({
      createIndexes: 'User',
      indexes: [{
        key: { googleId: 1 },
        name: GOOGLE_ID_INDEX_NAME,
        unique: true,
        partialFilterExpression: { googleId: { $gt: '' } },
      }],
    });
    return true;
  } catch (error) {
    if (error?.code === 11000) {
      logger.error('Google ID index was not created because duplicate IDs exist', error);
      return false;
    }
    if ([85, 86].includes(error?.code)) {
      const currentIndexes = await listUserIndexes(database);
      if (currentIndexes.some(isGoogleIdUniqueIndex)) return true;
    }
    throw error;
  }
};

module.exports = { ensureGoogleIdUniqueIndex };
