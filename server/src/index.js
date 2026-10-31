const http = require('node:http');
const app = require('./app');
const prisma = require('./config/prisma');
const env = require('./config/env');
const { initSocket } = require('./sockets/socketManager');
const logger = require('./utils/logger.util');
const { ensureGoogleIdUniqueIndex } = require('./services/google-id-index.service');

const PORT = env.PORT;
const server = http.createServer(app);

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    logger.error('Port is already in use', { port: PORT, code: error.code });
  } else {
    logger.error('HTTP server error', error);
  }
  process.exit(1);
});

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Prisma connected successfully');
    await ensureGoogleIdUniqueIndex(prisma);
    initSocket(server);
    server.listen(PORT, () => logger.info('Server listening', { port: PORT }));
  } catch (error) {
    logger.error('Prisma connection failed', error);
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}

module.exports = { app, server, startServer };
