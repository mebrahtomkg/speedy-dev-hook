import { ChildProcess, spawn } from 'node:child_process';
import { SERVER_FILE_PATH } from './constants.js';

export default class ServerManager {
  /** @type {ChildProcess | null} */
  server = null;

  /** @type {number | undefined} */
  serverPid = undefined;

  async start() {
    const child = spawn('node', [SERVER_FILE_PATH, '--port', '3000'], {
      stdio: 'inherit',
      env: process.env,
    });

    this.server = child;
    this.serverPid = child.pid;

    child.on('close', () => {
      if (this.server && this.serverPid === child.pid) {
        this.server = null;
        console.error('[ServerManager] Server crashed. Waiting for changes...');
      }
    });

    child.on('error', (err) => {
      this.server = null;
      console.error('[ServerManager] Failed to start server:', err);
    });
  }

  async restart() {
    if (this.server) await this.stop();
    await this.start();
  }

  async stop() {
    console.log('[ServerManager] Stopping server...');

    if (!this.server) return;

    const server = this.server;

    // Clear references immediately to prevent race conditions
    this.server = null;

    server.kill('SIGTERM'); // Send graceful termination signal

    await /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        // Graceful shutdown timeout: Force kill if it takes too long
        const timeout = setTimeout(() => {
          server.kill('SIGKILL'); // Forceful kill
          resolve();
        }, 5000);

        server.on('close', () => {
          clearTimeout(timeout); // Clear the forceful kill timeout
          resolve();
        });

        server.on('error', (err) => {
          console.error(`[ServerManager] Error during stopping server`, err);
          clearTimeout(timeout);
          resolve();
        });
      })
    );

    console.log('[ServerManager] Server stopped.');
  }
}
