import { createServer } from 'node:http';
import app from '@/app';
import { parsePort } from './utils';

const startServer = () => {
  const port = parsePort();

  const isValidPort = typeof port === 'number' && port && port > 0;

  if (!isValidPort) {
    throw new Error(`Invalid port: '${port}'`);
  }

  const httpServer = createServer(app);

  httpServer.listen(port, () => {
    console.log(`speedy-dev-hook server running on port ${port}`);
  });
};

startServer();
