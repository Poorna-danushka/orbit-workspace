const http = require('node:http');
const app = require('./app');
const prisma = require('./config/prisma');
const env = require('./config/env');
const { initSocket } = require('./sockets/socketManager');

const PORT = env.PORT;
const server = http.createServer(app);

const sanitizeDatabaseUrl = (value) => value.replace(/:\/\/[^:]+:[^@]+@/, '://user:****@');

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another process is bound to this port.`);
    console.error('If this was unexpected, find and stop the process using the port and restart the server.');
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
    initSocket(server);
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    const errorMessage = error?.message || String(error);
    console.error('Prisma connection failed:', sanitizeDatabaseUrl(errorMessage));
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}

module.exports = { app, server, startServer };
