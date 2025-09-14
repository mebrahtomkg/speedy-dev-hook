import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_FILE_PATH = path.resolve(
  __dirname,
  '../../dist',
  'server.cjs',
);
