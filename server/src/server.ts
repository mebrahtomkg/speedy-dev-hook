import { createServer } from 'node:http';
import app from '@/app';
import { parsePort, shutdown } from './utils';
import { scheduleServerShutdown } from './middlewares/serverLifeManager';

const startServer = () => {
  const port = parsePort();

  const isValidPort = typeof port === 'number' && port && port > 0;

  if (!isValidPort) {
    return shutdown(`Invalid port: '${port}'`);
  }

  const httpServer = createServer(app);

  httpServer.listen(port, () => {
    console.log(`speedy-dev-hook server running on port ${port}`);

    // Immediately schedule server shutdown when the server is started
    scheduleServerShutdown();
  });
};

startServer();
