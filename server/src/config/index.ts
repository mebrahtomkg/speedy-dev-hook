import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const PORT = 3000;

export const MAX_TXT_SIZE = 1 * 1024 * 1024; // 1MB

const CONFIG_FILE_PATH = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../../config.json',
);

interface AppConfig {
  supportedExtensions: string[];
}

let config: AppConfig;

try {
  const data = await readFile(CONFIG_FILE_PATH, 'utf8');

  config = JSON.parse(data);
} catch (error) {
  console.error('Failed to load config file: ', error);
  process.exit(0);
}

export const PRETTIER_SUPPORTED_EXTS = config.supportedExtensions;
