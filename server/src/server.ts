import { createServer } from 'node:http';
import app from '@/app';
import { PORT } from '@/config';

const startServer = () => {
  const httpServer = createServer(app);

  httpServer.listen(PORT, () => {
    console.log(`speedy-dev-hook server running on port ${PORT}`);
  });
};

startServer();
