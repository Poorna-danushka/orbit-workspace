const { PrismaClient } = require('@prisma/client');
const { DATABASE_URL } = require('./env');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
});

module.exports = prisma;
