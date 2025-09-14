import { rspack } from '@rspack/core';
import rspackConfig from '../../rspack.config.js';
import ServerManager from './ServerManager.js';

const serverManager = new ServerManager();

const compiler = rspack(rspackConfig);

const watching = compiler.watch({ aggregateTimeout: 30 }, (err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  if (!stats) throw new Error('Invalid rspack stats!');

  const info = stats?.toString({
    colors: true,
    preset: 'normal',
    warnings: false,
  });

  console.log(info);

  // Use a small timeout to ensure the file is fully written to disk
  setTimeout(async () => {
    await serverManager.restart();
  }, 100);
});

const shutdown = async () => {
  await serverManager.stop();
  watching.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);

process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await shutdown();
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await shutdown();
});
