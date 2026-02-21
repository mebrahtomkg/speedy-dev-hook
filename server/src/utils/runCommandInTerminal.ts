import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import process from 'node:process';

const runCommandInTerminal = async (
  command: string,
  cwd: string,
  title?: string,
) => {
  try {
    await fs.access(cwd, fs.constants.F_OK);
  } catch (_err) {
    throw new Error(`Working directory does not exist: '${cwd}'.`);
  }

  const platform = process.platform;
  const windowTitle = title || 'Terminal';

  // Suffix to keep Unix (macOS/Linux) terminals open after the process exits
  const keepOpenSuffix = '; echo ""; read';

  let executable = '';
  let args: string[] = [];

  if (platform === 'win32') {
    executable = 'cmd.exe';

    // Windows: Use 'start' to open a new window, and 'cmd /k' to keep it open.
    // The first quoted string in 'start' is the title.
    args = [
      '/c',
      'start',
      `"${windowTitle.replace(/"/g, '')}"`, // Force quotes so 'start' treats it as a title
      '/d',
      cwd,
      'cmd.exe',
      '/k',
      command,
    ];
  } else if (platform === 'darwin') {
    executable = 'osascript';

    // macOS: Safely escape single quotes for Bash execution
    const safeCwd = cwd.replace(/'/g, "'\\''");
    const bashCmd = `cd '${safeCwd}' && ${command}${keepOpenSuffix}`;

    // CRITICAL: Escape backslashes and double quotes for the AppleScript string literal
    const safeAppleScript = bashCmd.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const script = `tell application "Terminal"
      activate
      do script "${safeAppleScript}"
    end tell`;

    args = ['-e', script];
  } else {
    // Linux: Safely escape single quotes for Bash execution
    const safeCwd = cwd.replace(/'/g, "'\\''");
    const bashCmd = `cd '${safeCwd}' && ${command}${keepOpenSuffix}`;

    const terminals = [
      {
        bin: 'gnome-terminal',
        args: ['--title', windowTitle, '--', 'bash', '-c', bashCmd],
      },
      {
        bin: 'konsole',
        args: [
          '-p',
          `tabtitle=${windowTitle}`,
          '--workdir',
          cwd,
          '-e',
          'bash',
          '-c',
          bashCmd,
        ],
      },
      {
        bin: 'xfce4-terminal',
        args: [
          '-T',
          windowTitle,
          '--working-directory',
          cwd,
          '-x',
          'bash',
          '-c',
          bashCmd,
        ],
      },
      {
        bin: 'qterminal',
        args: ['--title', windowTitle, '-e', 'bash', '-c', bashCmd],
      },
      {
        bin: 'xterm',
        args: ['-T', windowTitle, '-e', 'bash', '-c', bashCmd],
      },
    ];

    for (const term of terminals) {
      try {
        // 'command -v' is standard POSIX and reliably executed by execSync's default shell
        execSync(`command -v ${term.bin}`, { stdio: 'ignore' });
        executable = term.bin;
        args = term.args;
        break;
      } catch {
        continue;
      }
    }

    if (!executable) throw new Error('No supported Linux terminal found.');
  }

  // Spawn the child process independently
  const child = spawn(executable, args, {
    cwd: cwd,
    detached: true, // Allows the parent Node process to exit
    stdio: 'ignore', // Disconnects I/O to prevent blocking
    shell: false, // Prevents secondary shell wrapping issues
    env: { ...process.env },
  });

  // Removes the child from the parent's event loop reference count
  child.unref();

  return child.pid;
};

export default runCommandInTerminal;
