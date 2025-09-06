import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const runCommandInTerminal = async (
  command: string,
  cwd: string,
  title?: string,
) => {
  // Ensure the working directory exists
  try {
    await fs.access(cwd, fs.constants.F_OK);
  } catch (_err) {
    throw new Error(`Working directory does not exist: '${cwd}'.`);
  }

  const child = spawn(
    'qterminal',
    ['--title', title || command, '-e', `bash -c "${command}; read"`],
    {
      cwd: cwd,
      detached: true,
      stdio: 'ignore',
      shell: false, // We are explicitly calling the terminal executable
    },
  );

  // Unreference the child process to allow the parent Node.js process to exit independently
  // even if the child process is still running.
  child.unref();

  // Handle potential errors from the child process itself (e.g., terminal command not found)
  child.on('error', (err) => {
    console.error(`Failed to launch terminal using command`, err);
  });

  return child.pid;
};

export default runCommandInTerminal;
